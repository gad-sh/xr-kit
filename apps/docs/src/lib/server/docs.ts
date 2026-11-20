// Reads content/*.md and renders it, at build time only (every route is prerendered, so
// marked and shiki never reach the browser). The same Markdown also goes out as-is (with
// absolute links and demo code inlined) for agents: <slug>.md, llms.txt, llms-full.txt.
//
// A page can embed a live demo from src/demos/ on a line of its own:
//   <!-- demo: ButtonKinds -->        rendered as HTML only
//   <!-- demo: ButtonKinds 3d -->     with a 3D preview (camera 1.2 m away)
//   <!-- demo: Panels 3d=1.8 -->      with the camera 1.8 m away
// The demo's source is shown under it, and is what the Markdown copies contain.
import { Marked, type Tokens } from 'marked';
import { createHighlighter, type Highlighter } from 'shiki';
import { NAV, SITE_URL, SLUGS, markdownUrl, relativeHref } from '#lib/nav.ts';

export type Page = { slug: string; title: string; description: string; section: string; body: string };
export type Segment = { type: 'html'; html: string } | { type: 'demo'; name: string; camera: number | null; code: string };

const files = import.meta.glob('/content/**/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const demoFiles = import.meta.glob('/src/demos/*.svelte', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

const demoSource = (name: string) => {
	const source = demoFiles[`/src/demos/${name}.svelte`];
	if (source === undefined) throw new Error(`docs: no demo src/demos/${name}.svelte`);
	return source.trim();
};

// Front matter is `key: value` lines between --- fences (title, description).
function parse(slug: string, raw: string, section: string): Page {
	const match = /^---\n([\s\S]*?)\n---\n/.exec(raw);
	if (!match) throw new Error(`docs: ${slug || 'index'}.md has no front matter`);
	const meta: Record<string, string> = {};
	for (const line of match[1].split('\n')) {
		const at = line.indexOf(':');
		if (at > 0) meta[line.slice(0, at).trim()] = line.slice(at + 1).trim();
	}
	if (!meta.title || !meta.description) throw new Error(`docs: ${slug || 'index'}.md needs a title and description`);
	return { slug, title: meta.title, description: meta.description, section, body: raw.slice(match[0].length).trim() };
}

export const pages: Page[] = NAV.flatMap((section) =>
	section.slugs.map((slug) => {
		const raw = files[`/content/${slug || 'index'}.md`];
		if (raw === undefined) throw new Error(`docs: nav lists "${slug}" but content/${slug || 'index'}.md is missing`);
		return parse(slug, raw, section.title);
	})
);

export const getPage = (slug: string) => pages.find((page) => page.slug === slug);

export function neighbours(slug: string) {
	const i = SLUGS.indexOf(slug);
	const at = (j: number) => (j >= 0 && j < pages.length ? { slug: pages[j].slug, title: pages[j].title } : null);
	return { prev: at(i - 1), next: at(i + 1) };
}

const DEMO = /^<!--\s*demo:\s*(\w+)(\s+3d(?:=([\d.]+))?)?\s*-->$/gm;

let highlighter: Promise<Highlighter> | undefined;
const getHighlighter = () =>
	(highlighter ??= createHighlighter({
		themes: ['github-dark-default'],
		langs: ['svelte', 'ts', 'js', 'sh', 'html', 'json', 'yaml'],
	}));

const slugify = (text: string) =>
	text
		.toLowerCase()
		.replace(/<[^>]+>/g, '')
		.replace(/&[a-z]+;/g, '')
		.replace(/[^\w\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-');

// Internal links are written root-relative to the docs (`/components/button#props`).
const internal = (href: string) => /^\/(?!\/)/.test(href);
const splitHash = (href: string) => {
	const at = href.indexOf('#');
	return at < 0 ? [href, ''] : [href.slice(0, at), href.slice(at)];
};
const slugOf = (path: string) => path.replace(/^\/|\/$/g, '');

function checkLink(from: string, path: string) {
	if (!SLUGS.includes(slugOf(path))) throw new Error(`docs: ${from || 'index'}.md links to ${path}, which isn't a page`);
}

// The page as HTML segments, with the demos between them.
export async function render(page: Page): Promise<Segment[]> {
	const hl = await getHighlighter();
	const highlight = (code: string, lang = '') =>
		hl.codeToHtml(code, { lang: hl.getLoadedLanguages().includes(lang) ? lang : 'text', theme: 'github-dark-default' });

	const marked = new Marked({
		gfm: true,
		renderer: {
			code: ({ text, lang }: Tokens.Code) => highlight(text, lang),
			heading({ tokens, depth }: Tokens.Heading) {
				const html = this.parser.parseInline(tokens);
				const id = slugify(html);
				return `<h${depth} id="${id}"><a class="anchor" href="#${id}">${html}</a></h${depth}>\n`;
			},
			link({ href, title, tokens }: Tokens.Link) {
				const text = this.parser.parseInline(tokens);
				const titleAttr = title ? ` title="${title}"` : '';
				if (internal(href)) {
					const [path, hash] = splitHash(href);
					checkLink(page.slug, path);
					return `<a href="${relativeHref(page.slug, slugOf(path), hash)}"${titleAttr}>${text}</a>`;
				}
				const external = /^https?:/.test(href) ? ' rel="noopener" data-sveltekit-reload' : '';
				return `<a href="${href}"${titleAttr}${external}>${text}</a>`;
			},
		},
	});

	const segments: Segment[] = [];
	let last = 0;
	for (const match of page.body.matchAll(DEMO)) {
		segments.push({ type: 'html', html: await marked.parse(page.body.slice(last, match.index)) });
		const [, name, is3d, distance] = match;
		segments.push({ type: 'demo', name, camera: is3d ? Number(distance ?? 1.2) : null, code: highlight(demoSource(name), 'svelte') });
		last = match.index + match[0].length;
	}
	segments.push({ type: 'html', html: await marked.parse(page.body.slice(last)) });
	return segments.filter((s) => s.type === 'demo' || s.html.trim());
}

// The page as Markdown for agents: demo markers become their source, and internal links
// point at the other pages' Markdown.
export function markdown(page: Page): string {
	const body = page.body
		.replace(DEMO, (_, name: string) => '```svelte\n' + demoSource(name) + '\n```')
		.replace(/\]\((\/[^)\s]*)\)/g, (_, href: string) => {
			const [path, hash] = splitHash(href);
			return `](${markdownUrl(slugOf(path))}${hash})`;
		});
	return `# ${page.title}\n\n> ${page.description}\n\n${body}\n`;
}

export function llmsTxt(): string {
	const lines = [
		'# xr-kit',
		'',
		'> Svelte 5 components and A-Frame 1.8 packages for websites that progressively enhance with WebXR: the same markup renders as HTML on a screen and as 3D in a VR headset.',
		'',
		`Every page below is Markdown. ${SITE_URL}/llms-full.txt is all of them in one file. Start with "Getting started", then "For agents", which lists the rules that matter most when writing code with the kit.`,
	];
	for (const section of NAV) {
		lines.push('', `## ${section.title}`, '');
		for (const page of pages.filter((p) => p.section === section.title)) {
			lines.push(`- [${page.title}](${markdownUrl(page.slug)}): ${page.description}`);
		}
	}
	return lines.join('\n') + '\n';
}

export function llmsFullTxt(): string {
	return pages.map(markdown).join('\n---\n\n');
}

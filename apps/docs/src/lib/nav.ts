// The sidebar, in order. Each slug is a file in content/ (`guides/surfaces` →
// content/guides/surfaces.md; '' → content/index.md). Its title and description come from
// the file's front matter. A page missing from here isn't built.

export const NAV: { title: string; slugs: string[] }[] = [
	{
		title: 'Start',
		slugs: ['', 'getting-started', 'templates', 'agents'],
	},
	{
		title: 'Guides',
		slugs: [
			'guides/2d-and-3d',
			'guides/surfaces',
			'guides/layout-3d',
			'guides/interaction',
			'guides/text-input',
			'guides/theming',
			'guides/frame-loop',
			'guides/testing',
			'guides/gotchas',
		],
	},
	{
		title: 'Components',
		slugs: [
			'components/scene3d',
			'components/surface',
			'components/button',
			'components/button-group',
			'components/panel',
			'components/stack',
			'components/text',
			'components/checkbox',
			'components/slider',
			'components/input',
			'components/keyboard',
			'components/tag',
			'components/spinner',
			'components/progress-bar',
			'components/avatar',
			'components/tooltip',
			'components/tabs',
			'components/menu',
			'components/radial-menu',
			'components/modal',
			'components/toaster',
			'components/theme-provider',
		],
	},
	{
		title: 'Reference',
		slugs: ['reference/api', 'reference/teleport', 'reference/tap-to-move', 'reference/bvh'],
	},
];

export const SLUGS = NAV.flatMap((section) => section.slugs);

// Where the site is published; absolute links in llms.txt and the Markdown copies use it.
export const SITE_URL = 'https://gad.sh/xr';
export const REPO_URL = 'https://github.com/gad-sh/xr-kit';

// A relative link from one page to another (every page URL ends in '/'), so the same build
// works whatever path it's served from.
export function relativeHref(from: string, to: string, hash = ''): string {
	const up = from ? '../'.repeat(from.split('/').length) : '';
	const href = up + (to ? `${to}/` : '');
	return (href || './') + hash;
}

// Where an agent finds a page as Markdown.
export const markdownUrl = (slug: string) => `${SITE_URL}/${slug || 'index'}.md`;

// The same, relative to the page itself (so it works in dev and on any host).
export const relativeMarkdownHref = (slug: string) => relativeHref(slug, '') + `${slug || 'index'}.md`;

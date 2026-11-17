// The page as Markdown, for agents: /components/button.md (the home page is /index.md).
import { error } from '@sveltejs/kit';
import { SLUGS } from '#lib/nav.ts';
import { getPage, markdown } from '#lib/server/docs.ts';
import type { EntryGenerator, RequestHandler } from './$types';

export const prerender = true;
export const trailingSlash = 'never';
export const entries: EntryGenerator = () => SLUGS.map((slug) => ({ slug: slug || 'index' }));

export const GET: RequestHandler = ({ params }) => {
	const page = getPage(params.slug === 'index' ? '' : params.slug);
	if (!page) error(404, 'Not found');
	return new Response(markdown(page), { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
};

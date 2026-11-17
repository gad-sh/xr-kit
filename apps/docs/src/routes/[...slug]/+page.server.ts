import { error } from '@sveltejs/kit';
import { SLUGS } from '#lib/nav.ts';
import { getPage, neighbours, render } from '#lib/server/docs.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => SLUGS.map((slug) => ({ slug }));

export const load: PageServerLoad = async ({ params }) => {
	// A rest param keeps the trailing slash ('guides/surfaces/').
	const page = getPage(params.slug.replace(/\/$/, ''));
	if (!page) error(404, 'Not found');
	return {
		slug: page.slug,
		title: page.title,
		description: page.description,
		section: page.section,
		segments: await render(page),
		...neighbours(page.slug),
	};
};

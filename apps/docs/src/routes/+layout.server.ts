import { NAV } from '#lib/nav.ts';
import { getPage } from '#lib/server/docs.ts';

export function load() {
	return {
		nav: NAV.map((section) => ({
			title: section.title,
			pages: section.slugs.map((slug) => ({ slug, title: getPage(slug)!.title })),
		})),
	};
}

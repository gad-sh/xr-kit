<script lang="ts">
	// The shell: a header, the sidebar (a drawer on narrow screens) and the page.
	// Importing @xr-kit/ui also loads its font (Geist), which the docs use too.
	import '@xr-kit/ui';
	import { page } from '$app/state';
	import { relativeHref } from '#lib/nav.ts';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	// The current page's slug ('' on the home page, and while showing an error).
	const slug = $derived(((page.params.slug as string | undefined) ?? '').replace(/\/$/, ''));
	const href = (to: string) => relativeHref(slug, to);
	let menuOpen = $state(false);
	$effect(() => {
		void page.url.pathname;
		menuOpen = false;
	});
</script>

<div class="shell">
	<header class="top">
		<button class="menu" type="button" aria-expanded={menuOpen} aria-controls="sidebar" onclick={() => (menuOpen = !menuOpen)}>
			<span class="sr-only">Menu</span>
			<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
		</button>
		<a class="brand" href={href('')}>xr-kit</a>
		<nav class="external" aria-label="Elsewhere">
			<a href={href('') + 'gallery/'} data-sveltekit-reload>Gallery</a>
			<a href="https://github.com/gad-sh/xr-kit" rel="noopener">GitHub</a>
			<a href="https://www.npmjs.com/package/@xr-kit/ui" rel="noopener">npm</a>
		</nav>
	</header>

	<aside id="sidebar" class:open={menuOpen}>
		<nav aria-label="Docs">
			{#each data.nav as section (section.title)}
				<h2>{section.title}</h2>
				<ul>
					{#each section.pages as item (item.slug)}
						<li>
							<a href={href(item.slug)} aria-current={item.slug === slug ? 'page' : undefined}>{item.title}</a>
						</li>
					{/each}
				</ul>
			{/each}
			<h2>For agents</h2>
			<ul>
				<li><a href={href('') + 'llms.txt'} data-sveltekit-reload>llms.txt</a></li>
				<li><a href={href('') + 'llms-full.txt'} data-sveltekit-reload>llms-full.txt</a></li>
			</ul>
		</nav>
	</aside>

	<main>
		{@render children()}
	</main>
</div>

<style>
	:global(:root) {
		--bg: #000;
		--bg-2: #141414;
		--bg-3: #1f1f1f;
		--border: #262626;
		--text: #fff;
		--text-2: #cbcbcb;
		--text-3: #8a8a8a;
		--accent: #276ef1;
		--accent-2: #5b91f5;
		--header: 56px;
		color-scheme: dark;
	}
	:global(body) {
		margin: 0;
		background: var(--bg);
		color: var(--text-2);
		font-family: Geist, system-ui, 'Segoe UI', Roboto, sans-serif;
		font-size: 16px;
		line-height: 1.65;
		-webkit-font-smoothing: antialiased;
	}
	:global(h1, h2, h3, h4) {
		color: var(--text);
		line-height: 1.25;
		font-weight: 600;
	}
	:global(main h1) {
		font-size: 36px;
		letter-spacing: -0.02em;
	}
	:global(main h2) {
		margin-top: 48px;
		font-size: 24px;
	}
	:global(main h3) {
		margin-top: 32px;
		font-size: 18px;
	}
	:global(main .anchor) {
		color: inherit;
		text-decoration: none;
	}
	:global(main .anchor:hover::after) {
		content: ' #';
		color: var(--text-3);
	}
	:global(main a) {
		color: var(--accent-2);
		text-underline-offset: 3px;
	}
	:global(main strong) {
		color: var(--text);
	}
	:global(code) {
		font-family: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.875em;
	}
	:global(main :not(pre) > code) {
		padding: 2px 5px;
		border-radius: 5px;
		background: var(--bg-3);
		color: var(--text);
	}
	:global(main pre) {
		margin: 20px 0;
		padding: 16px 20px;
		border: 1px solid var(--border);
		border-radius: 12px;
		overflow-x: auto;
		font-size: 14px;
		line-height: 1.6;
		tab-size: 2;
		background: #0a0a0a !important;
	}
	:global(main table) {
		display: block;
		overflow-x: auto;
		border-collapse: collapse;
		margin: 20px 0;
		font-size: 15px;
	}
	:global(main th),
	:global(main td) {
		padding: 8px 12px;
		border-bottom: 1px solid var(--border);
		text-align: left;
		vertical-align: top;
	}
	:global(main td:first-child code) {
		white-space: nowrap;
	}
	:global(main th) {
		color: var(--text);
		font-weight: 600;
	}
	:global(main blockquote) {
		margin: 20px 0;
		padding: 4px 16px;
		border-left: 3px solid var(--accent);
		background: var(--bg-2);
		border-radius: 0 8px 8px 0;
	}
	:global(main hr) {
		border: 0;
		border-top: 1px solid var(--border);
		margin: 40px 0;
	}
	:global(.sr-only) {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}

	.shell {
		display: grid;
		grid-template-columns: 260px minmax(0, 1fr);
		grid-template-rows: var(--header) 1fr;
		min-height: 100vh;
	}
	.top {
		grid-column: 1 / -1;
		position: sticky;
		top: 0;
		z-index: 20;
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 0 24px;
		border-bottom: 1px solid var(--border);
		background: rgb(0 0 0 / 0.85);
		backdrop-filter: blur(8px);
	}
	.brand {
		color: var(--text);
		font-weight: 600;
		font-size: 18px;
		text-decoration: none;
	}
	.external {
		display: flex;
		gap: 20px;
		margin-left: auto;
		font-size: 15px;
	}
	.external a {
		color: var(--text-2);
		text-decoration: none;
	}
	.external a:hover {
		color: var(--text);
	}
	.menu {
		display: none;
		padding: 6px;
		border: 0;
		background: none;
		color: var(--text);
		cursor: pointer;
	}
	aside {
		position: sticky;
		top: var(--header);
		height: calc(100vh - var(--header));
		overflow-y: auto;
		padding: 24px 16px 48px 24px;
		border-right: 1px solid var(--border);
		box-sizing: border-box;
	}
	aside h2 {
		margin: 24px 0 6px;
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-3);
	}
	aside h2:first-child {
		margin-top: 0;
	}
	aside ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	aside a {
		display: block;
		padding: 4px 10px;
		margin-left: -10px;
		border-radius: 6px;
		color: var(--text-2);
		text-decoration: none;
		font-size: 15px;
		line-height: 1.5;
	}
	aside a:hover {
		color: var(--text);
		background: var(--bg-2);
	}
	aside a[aria-current='page'] {
		color: var(--text);
		background: var(--bg-3);
	}
	main {
		min-width: 0;
		max-width: 820px;
		padding: 40px 48px 80px;
		box-sizing: border-box;
	}

	@media (max-width: 860px) {
		.shell {
			grid-template-columns: minmax(0, 1fr);
		}
		.top {
			padding: 0 16px;
			gap: 8px;
		}
		.menu {
			display: block;
		}
		.external {
			gap: 14px;
			font-size: 14px;
		}
		aside {
			display: none;
			position: fixed;
			inset: var(--header) 0 0 0;
			z-index: 10;
			height: auto;
			background: var(--bg);
			border-right: 0;
			padding: 16px;
		}
		aside.open {
			display: block;
		}
		main {
			padding: 24px 16px 64px;
		}
		:global(main h1) {
			font-size: 28px;
		}
	}
</style>

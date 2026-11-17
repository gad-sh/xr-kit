<script lang="ts">
	import Demo from '#lib/Demo.svelte';
	import { REPO_URL, markdownUrl, relativeHref, relativeMarkdownHref } from '#lib/nav.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const title = $derived(data.slug ? `${data.title} · xr-kit docs` : 'xr-kit docs');
	const source = $derived(`${REPO_URL}/blob/main/apps/docs/content/${data.slug || 'index'}.md`);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={data.description} />
	<link rel="alternate" type="text/markdown" href={markdownUrl(data.slug)} />
</svelte:head>

<article>
	<header>
		<p class="section">{data.section}</p>
		<h1>{data.title}</h1>
		<p class="lede">{data.description}</p>
		<p class="links">
			<a href={relativeMarkdownHref(data.slug)} data-sveltekit-reload>Markdown</a> ·
			<a href={source} rel="noopener">Edit on GitHub</a>
		</p>
	</header>

	{#each data.segments as segment, i (i)}
		{#if segment.type === 'html'}
			{@html segment.html}
		{:else}
			<Demo name={segment.name} camera={segment.camera} code={segment.code} />
		{/if}
	{/each}

	<nav class="pager" aria-label="Pages">
		{#if data.prev}
			<a class="prev" href={relativeHref(data.slug, data.prev.slug)}><span>Previous</span>{data.prev.title}</a>
		{/if}
		{#if data.next}
			<a class="next" href={relativeHref(data.slug, data.next.slug)}><span>Next</span>{data.next.title}</a>
		{/if}
	</nav>
</article>

<style>
	header {
		margin-bottom: 32px;
	}
	.section {
		margin: 0;
		color: var(--accent-2);
		font-size: 14px;
		font-weight: 500;
	}
	h1 {
		margin: 4px 0 8px;
	}
	.lede {
		margin: 0;
		font-size: 18px;
		color: var(--text-2);
	}
	.links {
		margin: 12px 0 0;
		font-size: 14px;
		color: var(--text-3);
	}
	.links a {
		color: var(--text-3);
	}
	.pager {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		margin-top: 56px;
		padding-top: 24px;
		border-top: 1px solid var(--border);
	}
	.pager a {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 12px 16px;
		border: 1px solid var(--border);
		border-radius: 10px;
		text-decoration: none;
		color: var(--text);
	}
	.pager a:hover {
		border-color: var(--text-3);
	}
	.pager span {
		font-size: 13px;
		color: var(--text-3);
	}
	.next {
		grid-column: 2;
		text-align: right;
	}
</style>

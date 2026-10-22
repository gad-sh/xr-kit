<script lang="ts">
	// The app's shell: the theme, the navigation and the toasts, for every route. The pages are
	// plain HTML components; only the routes under vr/ load A-Frame (see vr/+layout.svelte).
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { ThemeProvider, Toaster, defaultTheme as theme } from '@gadxr/ui';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const links = [
		{ href: resolve('/'), label: 'Home' },
		{ href: resolve('/settings'), label: 'Settings' },
		{ href: resolve('/vr'), label: 'VR' },
	];
	const vr = $derived(page.url.pathname.startsWith(resolve('/vr')));
</script>

<ThemeProvider {theme}>
	<div
		class="app"
		style:--bg={theme.colors.backgroundPrimary}
		style:--panel={theme.colors.panel.fill}
		style:--border={theme.colors.panel.border}
		style:--text={theme.colors.contentPrimary}
		style:--muted={theme.colors.contentSecondary}
		style:--hover={theme.colors.button.tertiary.hover}
		style:--font={theme.typography.fontFamily}
	>
		<!-- Over the scene's canvas on the VR route (A-Frame makes it fill the window). -->
		<nav class:over={vr}>
			{#each links as link (link.href)}
				<a href={link.href} aria-current={page.url.pathname === link.href ? 'page' : undefined}>{link.label}</a>
			{/each}
		</nav>
		<main>
			{@render children()}
		</main>
		<!-- 2D toasts for the whole app. The VR route has its own 3D Toaster, in view in a headset. -->
		{#if !vr}
			<Toaster placement="bottom-right" />
		{/if}
	</div>
</ThemeProvider>

<style>
	:global(body) {
		margin: 0;
		background: #000;
	}
	.app {
		min-height: 100vh;
		background: var(--bg);
		color: var(--text);
		font-family: var(--font);
	}
	nav {
		display: flex;
		gap: 4px;
		padding: 12px 16px;
		border-bottom: 1px solid var(--border);
		background: var(--panel);
	}
	nav.over {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 10;
		background: transparent;
		border-bottom: none;
	}
	nav a {
		padding: 8px 12px;
		border-radius: 8px;
		color: var(--muted);
		text-decoration: none;
		font-weight: 500;
	}
	nav a:hover {
		background: var(--hover);
	}
	nav a[aria-current='page'] {
		color: var(--text);
		background: var(--hover);
	}
	main {
		max-width: 720px;
		margin: 0 auto;
		padding: 24px 16px;
	}
</style>

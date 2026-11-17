<script lang="ts">
	// Puts a theme in context for everything inside it, 2D and 3D. Renders no DOM.
	import type { Snippet } from 'svelte';
	import { setTheme } from './context';
	import { defaultTheme, type Theme } from './theme';

	let { theme = defaultTheme, children }: { theme?: Theme; children: Snippet } = $props();
	setTheme(() => theme);
</script>

{@render children()}

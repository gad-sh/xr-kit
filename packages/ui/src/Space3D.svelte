<script lang="ts">
	// Everything inside renders as A-Frame entities instead of HTML. Wrap an
	// <a-scene> (or any subtree of one) in it. Renders no DOM.
	import type { Snippet } from 'svelte';
	import { setDimension } from './context';

	let { children }: { children: Snippet } = $props();
	setDimension('3d');
</script>

{@render children()}

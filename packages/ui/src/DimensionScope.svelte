<script lang="ts">
	// Internal: renders children as HTML or 3D regardless of the surrounding context.
	import type { Snippet } from 'svelte';
	import { setDimension } from './context';
	import type { Dimension } from './theme';

	let { dimension, children }: { dimension: Dimension; children: Snippet } = $props();
	// svelte-ignore state_referenced_locally
	setDimension(dimension);
</script>

{@render children()}

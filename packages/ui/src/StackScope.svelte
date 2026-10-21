<script lang="ts">
	// Internal: gives part of a component's children a different 3D stack than the
	// rest — or none, so they're placed by hand (e.g. a Panel's corner action).
	import type { Snippet } from 'svelte';
	import { setStack, type Stack } from './layout.svelte';

	let { stack, children }: { stack?: Stack; children: Snippet } = $props();
	// svelte-ignore state_referenced_locally
	setStack(stack);
</script>

{@render children()}

<script lang="ts">
	// One tab of a <Tabs>: its title goes in the bar, its content shows while active.
	import type { Snippet } from 'svelte';
	import { getDimension } from './context';
	import { getTabs } from './tabs-context';

	type Props = { key: string; title: string; disabled?: boolean; children?: Snippet };
	let { key, title, disabled = false, children }: Props = $props();

	const tabs = getTabs();
	if (!tabs) throw new Error('<Tab> must be inside <Tabs>');
	const entry = {
		get key() { return key; },
		get title() { return title; },
		get disabled() { return disabled; },
	};
	tabs.register(entry);
	$effect(() => () => tabs.unregister(entry));

	const is3d = getDimension() === '3d';
	const active = $derived(tabs.active === key);
</script>

{#if active}
	{#if is3d}
		{@render children?.()}
	{:else}
		<div class="ui-tab-panel" role="tabpanel" id="{tabs.id}-panel-{key}" aria-labelledby="{tabs.id}-tab-{key}">
			{@render children?.()}
		</div>
	{/if}
{/if}

<style>
	.ui-tab-panel {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
	}
</style>

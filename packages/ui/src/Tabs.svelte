<script lang="ts">
	// Base UI-style Tabs: a bar of tab titles over the active <Tab>'s content.
	//   <Tabs bind:active><Tab key="a" title="A">…</Tab><Tab key="b" title="B">…</Tab></Tabs>
	// With no `active`, the first enabled tab is shown. 2D follows the WAI-ARIA tabs
	// pattern (arrow keys move between tabs). In 3D the bar and the content stack in a column.
	import type { Snippet } from 'svelte';
	import { nextIndex } from './component-style';
	import { getDimension, getTheme } from './context';
	import { createStack, setStack, useSlot } from './layout.svelte';
	import Pressable3D from './Pressable3D.svelte';
	import Stack from './Stack.svelte';
	import { setTabs, type TabEntry } from './tabs-context';
	import type { Dimension } from './theme';

	type Props = {
		children: Snippet;
		active?: string;
		onchange?: (key: string) => void;
		// px, between the bar and the content (3D).
		gap?: number;
		dimension?: Dimension;
		[attribute: string]: unknown;
	};

	let { children, active = $bindable(), onchange, gap = 12, dimension, style: userStyle = '', ...rest }: Props = $props();

	const theme = getTheme();
	const t = $derived(theme());
	const c = $derived(t.colors.tabs);
	const font = $derived(t.typography[t.tabs.typography]);
	const uid = `ui-tabs-${Math.random().toString(36).slice(2, 8)}`;

	let tabs = $state.raw<TabEntry[]>([]);
	const current = $derived(active ?? tabs.find((tab) => !tab.disabled)?.key);

	function select(key: string) {
		if (key === current) return;
		active = key;
		onchange?.(key);
	}

	setTabs({
		id: uid,
		register: (tab) => (tabs = [...tabs, tab]),
		unregister: (tab) => (tabs = tabs.filter((x) => x !== tab)),
		get active() {
			return current;
		},
	});

	const contextDimension = getDimension();
	// svelte-ignore state_referenced_locally
	const is3d = (dimension ?? contextDimension) === '3d';
	const m = (px: number) => px * t.space3d.metersPerPx;
	const column = is3d ? createStack(() => ({ direction: 'column', gap: m(gap), align: 'start' })) : undefined;
	const slot = is3d ? useSlot(() => column!.size) : () => ({ x: 0, y: 0 });
	setStack(column);

	// 2D keyboard: arrows / Home / End move to (and select) another enabled tab.
	let buttons: HTMLButtonElement[] = $state([]);
	function onkeydown(event: KeyboardEvent) {
		const usable = tabs.map((tab) => !tab.disabled);
		const from = tabs.findIndex((tab) => tab.key === current);
		const to =
			event.key === 'ArrowRight' ? nextIndex(usable, from, 1)
			: event.key === 'ArrowLeft' ? nextIndex(usable, from, -1)
			: event.key === 'Home' ? nextIndex(usable, -1, 1, false)
			: event.key === 'End' ? nextIndex(usable, tabs.length, -1, false)
			: -1;
		if (to < 0 || to === from) return;
		event.preventDefault();
		select(tabs[to].key);
		buttons[to]?.focus();
	}
</script>

{#if is3d}
	<a-entity {...rest}>
		<a-entity position="{slot().x} {slot().y} 0">
			<Stack direction="row" gap={t.tabs.gap}>
				{#each tabs as tab (tab)}
					<Pressable3D
						label={tab.title}
						{font}
						textColor={tab.disabled ? t.colors.buttonDisabledText : tab.key === current ? c.textActive : c.text}
						height={t.tabs.height}
						paddingX={t.tabs.paddingX}
						radius={t.tabs.radius}
						hoverFill={c.hover}
						activeFill={c.hover}
						indicator={{ color: c.indicator, height: t.tabs.indicator }}
						selected={tab.key === current}
						disabled={tab.disabled}
						onclick={() => select(tab.key)}
					/>
				{/each}
			</Stack>
			{@render children()}
		</a-entity>
	</a-entity>
{:else}
	<div
		class="ui-tabs"
		style="--ui-text: {c.text}; --ui-text-active: {c.textActive}; --ui-hover: {c.hover}; --ui-indicator: {c.indicator}; --ui-border: {c.border}; --ui-height: {t.tabs.height}px; --ui-padding-x: {t.tabs.paddingX}px; --ui-radius: {t.tabs.radius}px; --ui-indicator-height: {t.tabs.indicator}px; --ui-gap: {gap}px; --ui-focus: {t.colors.accent}; --ui-disabled: {t.colors.buttonDisabledText}; --ui-font: {font.fontWeight} {font.fontSize}px/{font.lineHeight}px {t.typography.fontFamily}; {userStyle}"
		{...rest}
	>
		<div role="tablist" tabindex="-1" {onkeydown}>
			{#each tabs as tab, i (tab)}
				<button
					bind:this={buttons[i]}
					type="button"
					role="tab"
					id="{uid}-tab-{tab.key}"
					aria-controls="{uid}-panel-{tab.key}"
					aria-selected={tab.key === current}
					tabindex={tab.key === current ? 0 : -1}
					disabled={tab.disabled}
					onclick={() => select(tab.key)}
				>
					{tab.title}
				</button>
			{/each}
		</div>
		{@render children()}
	</div>
{/if}

<style>
	.ui-tabs {
		display: flex;
		flex-direction: column;
		gap: var(--ui-gap);
		align-self: stretch;
	}
	[role='tablist'] {
		display: flex;
		gap: 4px;
		border-bottom: 1px solid var(--ui-border);
	}
	button {
		height: var(--ui-height);
		padding: 0 var(--ui-padding-x);
		border: 0;
		border-radius: var(--ui-radius) var(--ui-radius) 0 0;
		background: transparent;
		color: var(--ui-text);
		font: var(--ui-font);
		cursor: pointer;
		box-shadow: inset 0 calc(-1 * var(--ui-indicator-height)) 0 transparent;
		transition: background-color 0.2s, box-shadow 0.2s, color 0.2s;
	}
	button:hover:not(:disabled) {
		background: var(--ui-hover);
	}
	button[aria-selected='true'] {
		color: var(--ui-text-active);
		box-shadow: inset 0 calc(-1 * var(--ui-indicator-height)) 0 var(--ui-indicator);
	}
	button:disabled {
		color: var(--ui-disabled);
		cursor: not-allowed;
	}
	button:focus-visible {
		outline: 3px solid var(--ui-focus);
		outline-offset: -3px;
	}
</style>

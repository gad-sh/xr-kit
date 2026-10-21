<script lang="ts" module>
	export type MenuItem = { id?: string; label: string; end?: string; disabled?: boolean } | { divider: true };
</script>

<script lang="ts">
	// Base UI-style Menu: a list of selectable items, with optional end labels
	// (shortcuts, counts), dividers and disabled items.
	//   <Menu items={[{ label: 'Wave', end: '1' }, { divider: true }, { label: 'Leave' }]} onselect={…} />
	// Pass `selected` (an item's id, or its label) to make it a single-choice menu with a check.
	// 2D: roving focus with arrow keys / Home / End. 3D: equal-width rows on a backing slab.
	import { ensure3d } from './aframe';
	import { nextIndex } from './component-style';
	import { getDimension, getTheme } from './context';
	import { createStack, setStack, useSlot } from './layout.svelte';
	import Pressable3D from './Pressable3D.svelte';
	import Rule3D from './Rule3D.svelte';
	import type { Dimension } from './theme';

	type Item = Exclude<MenuItem, { divider: true }>;

	type Props = {
		items: MenuItem[];
		onselect?: (item: Item, index: number) => void;
		selected?: string;
		// px; the menu is at least this wide.
		width?: number;
		dimension?: Dimension;
		[attribute: string]: unknown;
	};

	let { items, onselect, selected = $bindable(), width, dimension, style: userStyle = '', ...rest }: Props = $props();

	const theme = getTheme();
	const t = $derived(theme());
	const c = $derived(t.colors.menu);
	const tk = $derived(t.menu);
	const font = $derived(t.typography[tk.typography]);
	const endFont = $derived(t.typography[tk.endTypography]);
	const isDivider = (item: MenuItem): item is { divider: true } => 'divider' in item;
	const idOf = (item: Item) => item.id ?? item.label;
	const selectable = $derived(selected !== undefined);

	function choose(item: Item, index: number) {
		if (item.disabled) return;
		if (selectable) selected = idOf(item);
		onselect?.(item, index);
	}

	// What goes on the right: the item's end label, else a check when it's the selected one.
	const endOf = (item: Item) => item.end ?? (selectable && selected === idOf(item) ? '✓' : undefined);
	const textOf = (item: Item) =>
		item.disabled ? t.colors.buttonDisabledText : selectable && selected === idOf(item) ? c.selected : c.text;

	const contextDimension = getDimension();
	// svelte-ignore state_referenced_locally
	const is3d = (dimension ?? contextDimension) === '3d';

	// ---- 3D ----
	const m = (px: number) => px * t.space3d.metersPerPx;
	if (is3d) ensure3d();
	const column = is3d ? createStack(() => ({ direction: 'column', gap: 0 })) : undefined;
	const pad = $derived(m(tk.padding));
	// Rows are drawn as wide as the widest one (or the menu's width).
	const rowWidth = $derived(Math.max(column?.size.width ?? 0, m(width ?? tk.minWidth) - 2 * pad));
	const outer = $derived({ width: rowWidth + 2 * pad, height: (column?.size.height ?? 0) + 2 * pad });
	const slot = is3d ? useSlot(() => outer) : () => ({ x: 0, y: 0 });
	setStack(column);
	const depth = 0.02;

	// ---- 2D ----
	let buttons: HTMLButtonElement[] = $state([]);
	const usable = $derived(items.map((item) => !isDivider(item) && !item.disabled));
	let focusIndex = $state(-1);
	const tabStop = $derived(focusIndex >= 0 ? focusIndex : usable.indexOf(true));

	function onkeydown(event: KeyboardEvent) {
		const from = tabStop;
		const to =
			event.key === 'ArrowDown' ? nextIndex(usable, from, 1)
			: event.key === 'ArrowUp' ? nextIndex(usable, from, -1)
			: event.key === 'Home' ? nextIndex(usable, -1, 1, false)
			: event.key === 'End' ? nextIndex(usable, items.length, -1, false)
			: -1;
		if (to < 0) return;
		event.preventDefault();
		focusIndex = to;
		buttons[to]?.focus();
	}
</script>

{#if is3d}
	<a-entity {...rest}>
		<a-entity position="{slot().x} {slot().y} 0">
			<a-entity
				rounded="width: {outer.width}; height: {outer.height}; depth: {depth}; radius: {Math.min(m(tk.radius), outer.height / 2)}; color: {c.fill}; opacity: {t.space3d.panelOpacity}"
				position="{-outer.width / 2} {-outer.height / 2} {-depth}"
			></a-entity>
			<a-entity position="0 0 0.002">
				{#each items as item, i}
					{#if isDivider(item)}
						<Rule3D width={rowWidth - 2 * m(tk.paddingX)} color={c.divider} />
					{:else}
						<Pressable3D
							label={item.label}
							end={endOf(item)}
							{font}
							{endFont}
							textColor={textOf(item)}
							endColor={selectable && selected === idOf(item) ? c.selected : c.end}
							height={tk.itemHeight}
							paddingX={tk.paddingX}
							radius={tk.itemRadius}
							fillWidth={rowWidth}
							align="start"
							hoverFill={c.hover}
							activeFill={c.active}
							disabled={item.disabled}
							onclick={() => choose(item, i)}
						/>
					{/if}
				{/each}
			</a-entity>
		</a-entity>
	</a-entity>
{:else}
	<div
		class="ui-menu"
		role="menu"
		tabindex="-1"
		{onkeydown}
		style="--ui-fill: {c.fill}; --ui-border: {c.border}; --ui-hover: {c.hover}; --ui-active: {c.active}; --ui-text: {c.text}; --ui-end: {c.end}; --ui-selected: {c.selected}; --ui-divider: {c.divider}; --ui-disabled: {t.colors.buttonDisabledText}; --ui-focus: {t.colors.accent}; --ui-padding: {tk.padding}px; --ui-padding-x: {tk.paddingX}px; --ui-radius: {tk.radius}px; --ui-item-radius: {tk.itemRadius}px; --ui-item-height: {tk.itemHeight}px; --ui-width: {width ?? tk.minWidth}px; --ui-font: {font.fontWeight} {font.fontSize}px/{font.lineHeight}px {t.typography.fontFamily}; --ui-end-font: {endFont.fontWeight} {endFont.fontSize}px/{endFont.lineHeight}px {t.typography.fontFamily}; {userStyle}"
		{...rest}
	>
		{#each items as item, i}
			{#if isDivider(item)}
				<hr />
			{:else}
				<button
					bind:this={buttons[i]}
					type="button"
					role={selectable ? 'menuitemradio' : 'menuitem'}
					aria-checked={selectable ? selected === idOf(item) : undefined}
					class:selected={selectable && selected === idOf(item)}
					tabindex={i === tabStop ? 0 : -1}
					disabled={item.disabled}
					onfocus={() => (focusIndex = i)}
					onclick={() => choose(item, i)}
				>
					<span>{item.label}</span>
					{#if endOf(item)}<span class="end">{endOf(item)}</span>{/if}
				</button>
			{/if}
		{/each}
	</div>
{/if}

<style>
	.ui-menu {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		min-width: var(--ui-width);
		padding: var(--ui-padding);
		border-radius: var(--ui-radius);
		background: var(--ui-fill);
		border: 1px solid var(--ui-border);
	}
	button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		height: var(--ui-item-height);
		padding: 0 var(--ui-padding-x);
		border: 0;
		border-radius: var(--ui-item-radius);
		background: transparent;
		color: var(--ui-text);
		font: var(--ui-font);
		text-align: left;
		cursor: pointer;
	}
	button:hover:not(:disabled) {
		background: var(--ui-hover);
	}
	button:active:not(:disabled) {
		background: var(--ui-active);
	}
	button:focus-visible {
		outline: 3px solid var(--ui-focus);
		outline-offset: -3px;
	}
	button:disabled {
		color: var(--ui-disabled);
		cursor: not-allowed;
	}
	.selected {
		color: var(--ui-selected);
	}
	.end {
		font: var(--ui-end-font);
		color: var(--ui-end);
	}
	.selected .end {
		color: var(--ui-selected);
	}
	hr {
		width: calc(100% - 2 * var(--ui-padding-x));
		margin: 6px auto;
		border: 0;
		border-top: 1px solid var(--ui-divider);
	}
</style>

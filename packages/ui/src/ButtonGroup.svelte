<script lang="ts">
	// A row of Buttons sharing kind/size/shape. With `mode`, it tracks selection like
	// Base UI's ButtonGroup: "radio" → `selected` is an index, "checkbox" → an array.
	// In 3D the buttons are laid out in a row centered on the group's position, and the
	// group takes its place in a parent Panel like any other item.
	import type { Snippet } from 'svelte';
	import { getDimension, getTheme, setButtonGroup, setDimension } from './context';
	import { createStack, setStack, useSlot } from './layout.svelte';
	import type { ButtonKind, ButtonShape, ButtonSize, Dimension } from './theme';

	type Props = {
		children: Snippet;
		kind?: ButtonKind;
		size?: ButtonSize;
		shape?: ButtonShape;
		disabled?: boolean;
		mode?: 'radio' | 'checkbox';
		selected?: number | number[];
		// px, like every other token; converted to meters in 3D.
		gap?: number;
		dimension?: Dimension;
		[attribute: string]: unknown;
	};

	const theme = getTheme();
	let {
		children,
		kind,
		size,
		shape,
		disabled = false,
		mode,
		selected = $bindable(),
		gap = theme().sizing.scale300,
		dimension,
		style: userStyle = '',
		...rest
	}: Props = $props();

	const contextDimension = getDimension();
	// So the buttons inside follow an explicit `dimension` on the group. Context is set
	// once, so changing `dimension` later has no effect.
	// svelte-ignore state_referenced_locally
	if (dimension) setDimension(dimension);
	let count = 0;

	// 3D layout. Order matters: join the parent's stack before providing our own.
	// svelte-ignore state_referenced_locally
	const is3d = (dimension ?? contextDimension) === '3d';
	const row = is3d ? createStack(() => ({ direction: 'row', gap: gap * theme().space3d.metersPerPx })) : undefined;
	const slot = is3d ? useSlot(() => row!.size) : () => ({ x: 0, y: 0 });
	setStack(row);

	setButtonGroup({
		get kind() { return kind; },
		get size() { return size; },
		get shape() { return shape; },
		get disabled() { return disabled; },
		register: () => count++,
		isSelected(index) {
			if (!mode) return undefined;
			return Array.isArray(selected) ? selected.includes(index) : selected === index;
		},
		select(index) {
			if (mode === 'radio') selected = index;
			if (mode === 'checkbox') {
				const current = Array.isArray(selected) ? selected : [];
				selected = current.includes(index) ? current.filter((i) => i !== index) : [...current, index];
			}
		},
	});
</script>

{#if (dimension ?? contextDimension) === '3d'}
	<a-entity {...rest}>
		<a-entity position="{slot().x} {slot().y} 0">{@render children()}</a-entity>
	</a-entity>
{:else}
	<div role="group" style="display: inline-flex; gap: {gap}px; {userStyle}" {...rest}>
		{@render children()}
	</div>
{/if}

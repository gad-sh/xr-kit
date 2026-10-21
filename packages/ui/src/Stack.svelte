<script lang="ts">
	// Layout only: a row or column of anything. Flexbox in 2D; in 3D it stacks its
	// children by measured size and takes its place in a parent Panel / Stack.
	import type { Snippet } from 'svelte';
	import { getDimension, getTheme } from './context';
	import { createStack, setStack, useSlot } from './layout.svelte';
	import type { Align } from './layout-math';
	import type { Dimension } from './theme';

	type Props = {
		children: Snippet;
		direction?: 'row' | 'column';
		// px
		gap?: number;
		align?: Align;
		// This stack's own alignment inside its parent (like CSS align-self).
		alignSelf?: Align;
		dimension?: Dimension;
		[attribute: string]: unknown;
	};

	const theme = getTheme();
	let {
		children,
		direction = 'row',
		gap = theme().sizing.scale300,
		align = 'center',
		alignSelf,
		dimension,
		style: userStyle = '',
		...rest
	}: Props = $props();

	const contextDimension = getDimension();
	// svelte-ignore state_referenced_locally
	const is3d = (dimension ?? contextDimension) === '3d';
	const stack = is3d ? createStack(() => ({ direction, gap: gap * theme().space3d.metersPerPx, align })) : undefined;
	const slot = is3d ? useSlot(() => ({ ...stack!.size, align: alignSelf })) : () => ({ x: 0, y: 0 });
	setStack(stack);

	const flex = { start: 'flex-start', center: 'center', end: 'flex-end' };
</script>

{#if is3d}
	<a-entity {...rest}>
		<a-entity position="{slot().x} {slot().y} 0">{@render children()}</a-entity>
	</a-entity>
{:else}
	<div
		style="display: inline-flex; flex-direction: {direction}; gap: {gap}px; align-items: {flex[align]}; {alignSelf
			? `align-self: ${flex[alignSelf]};`
			: ''} {userStyle}"
		{...rest}
	>
		{@render children()}
	</div>
{/if}

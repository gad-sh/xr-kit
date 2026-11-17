<script lang="ts">
	// A container: optional title, then children in a column. In 3D the children are
	// stacked by measured size and the backing slab (solid or glass) grows to fit them.
	// `action` goes in the top-right corner (e.g. a close button), outside the column.
	import type { Snippet } from 'svelte';
	import { ensure3d } from './aframe';
	import { getDimension, getTheme } from './context';
	import { createStack, setStack, useSlot } from './layout.svelte';
	import StackScope from './StackScope.svelte';
	import Text from './Text.svelte';
	import type { Dimension } from './theme';

	type Props = {
		children?: Snippet;
		title?: string;
		action?: Snippet;
		kind?: 'solid' | 'glass';
		// Background color override (solid panels), e.g. a toast's kind color.
		fill?: string;
		// 3D: the slab absorbs cursor clicks, so they don't reach what's behind (modals).
		catchClicks?: boolean;
		// Cross-axis alignment of the children.
		align?: 'start' | 'center';
		// px. Width is a minimum in 3D (content can make it wider).
		width?: number;
		padding?: number;
		gap?: number;
		dimension?: Dimension;
		[attribute: string]: unknown;
	};

	const theme = getTheme();
	let {
		children,
		title,
		action,
		kind = 'solid',
		fill,
		catchClicks = false,
		align = 'start',
		width,
		padding = theme().panel.padding,
		gap = theme().panel.gap,
		dimension,
		style: userStyle = '',
		...rest
	}: Props = $props();

	const t = $derived(theme());
	const m = (px: number) => px * t.space3d.metersPerPx;
	const contextDimension = getDimension();
	// svelte-ignore state_referenced_locally
	const is3d = (dimension ?? contextDimension) === '3d';

	// 3D: join the parent's stack (if nested), then stack our own children.
	if (is3d) ensure3d();
	const column = is3d ? createStack(() => ({ direction: 'column', gap: m(gap), align })) : undefined;
	const innerWidth = $derived(Math.max(column?.size.width ?? 0, width ? m(width) - 2 * m(padding) : 0));
	const outer = $derived({ width: innerWidth + 2 * m(padding), height: (column?.size.height ?? 0) + 2 * m(padding) });
	const slot = is3d ? useSlot(() => outer) : () => ({ x: 0, y: 0 });
	setStack(column);
	const actionRow = is3d ? createStack(() => ({ direction: 'row', gap: m(8) })) : undefined;
	// The action's row is centered on the title line (or just tucked into the corner).
	const titleHeight = $derived(title ? m(t.typography.HeadingSmall.lineHeight) * t.space3d.textScale : (actionRow?.size.height ?? 0));
	const actionPosition = $derived({
		x: outer.width / 2 - m(padding) - (actionRow?.size.width ?? 0) / 2,
		y: outer.height / 2 - m(padding) - titleHeight / 2,
	});
	const background = $derived(fill ?? t.colors.panel.fill);

	const depth = 0.02;
	const slab = $derived(
		[
			`width: ${outer.width}`,
			`height: ${outer.height}`,
			`depth: ${depth}`,
			`radius: ${Math.min(m(t.panel.radius), outer.height / 2)}`,
			`glass: ${kind === 'glass'}`,
			`color: ${background}`,
			`opacity: ${kind === 'glass' ? 1 : t.space3d.panelOpacity}`,
		].join('; ')
	);
	// Start-aligned children line up with the inner left edge even when `width` makes the panel wider.
	const contentX = $derived(align === 'start' ? -(innerWidth - (column?.size.width ?? 0)) / 2 : 0);
</script>

{#if is3d}
	<a-entity {...rest}>
		<a-entity position="{slot().x} {slot().y} 0">
			<!-- The slab's front face sits at z = 0; content just in front of it. -->
			<a-entity rounded={slab} position="{-outer.width / 2} {-outer.height / 2} {-depth}"></a-entity>
			{#if catchClicks}
				<a-entity
					class="raycastable"
					geometry="primitive: plane; width: {outer.width}; height: {outer.height}"
					material="visible: false"
					position="0 0 0.001"
				></a-entity>
			{/if}
			<a-entity position="{contentX} 0 0.005">
				{#if title}<Text variant="HeadingSmall" text={title} />{/if}
				{@render children?.()}
			</a-entity>
			{#if action}
				<a-entity position="{actionPosition.x} {actionPosition.y} 0.005">
					<StackScope stack={actionRow}>{@render action()}</StackScope>
				</a-entity>
			{/if}
		</a-entity>
	</a-entity>
{:else}
	<section
		class="ui-panel"
		class:glass={kind === 'glass'}
		class:has-corner-action={action && !title}
		style="--ui-fill: {background}; --ui-border: {fill ? `color-mix(in srgb, ${fill} 70%, white 10%)` : t.colors.panel.border}; --ui-radius: {t.panel.radius}px; --ui-padding: {padding}px; --ui-gap: {gap}px; --ui-align: {align === 'start'
			? 'flex-start'
			: 'center'}; {width ? `width: ${width}px;` : ''} {userStyle}"
		{...rest}
	>
		{#if title && action}
			<div class="header"><Text variant="HeadingSmall" text={title} />{@render action()}</div>
		{:else if title}
			<Text variant="HeadingSmall" text={title} />
		{:else if action}
			<div class="corner">{@render action()}</div>
		{/if}
		{@render children?.()}
	</section>
{/if}

<style>
	.ui-panel {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: var(--ui-align);
		gap: var(--ui-gap);
		padding: var(--ui-padding);
		border-radius: var(--ui-radius);
		background: var(--ui-fill);
		border: 1px solid var(--ui-border);
	}
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		align-self: stretch;
	}
	.has-corner-action {
		position: relative;
		padding-right: calc(var(--ui-padding) + 32px);
	}
	.corner {
		position: absolute;
		top: calc(var(--ui-padding) / 2);
		right: calc(var(--ui-padding) / 2);
	}
	.glass {
		background: color-mix(in srgb, var(--ui-fill) 55%, transparent);
		backdrop-filter: blur(16px) saturate(1.4);
	}
</style>

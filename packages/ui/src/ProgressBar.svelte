<script lang="ts">
	// Base UI-style ProgressBar: how far along something is (a download, a vote, loading).
	// `infinite` when there's no known amount: a segment sweeps back and forth instead.
	// Optional header row: `label` on the left, the percentage on the right (`showValue`).
	import { ensure3d } from './aframe';
	import { sliderFraction } from './component-style';
	import { getDimension, getTheme } from './context';
	import { setStack, useSlot } from './layout.svelte';
	import Text from './Text.svelte';
	import type { Dimension, ProgressBarSize } from './theme';

	type Props = {
		value?: number;
		max?: number;
		infinite?: boolean;
		size?: ProgressBarSize;
		label?: string;
		showValue?: boolean;
		color?: string;
		// px
		width?: number;
		dimension?: Dimension;
		[attribute: string]: unknown;
	};

	const theme = getTheme();
	let {
		value = 0,
		max = 100,
		infinite = false,
		size = 'medium',
		label = '',
		showValue = false,
		color,
		width = theme().progressBar.width,
		dimension,
		style: userStyle = '',
		...rest
	}: Props = $props();

	const t = $derived(theme());
	const tk = $derived(t.progressBar);
	const fill = $derived(color ?? t.colors.progressBar.fill);
	const fraction = $derived(sliderFraction(value, 0, max));
	const percent = $derived(`${Math.round(fraction * 100)}%`);
	const font = $derived(t.typography[tk.typography]);
	const hasHeader = $derived(!!label || (showValue && !infinite));
	const contextDimension = getDimension();
	// svelte-ignore state_referenced_locally
	const is3d = (dimension ?? contextDimension) === '3d';

	// ---- 3D ----
	const m = (px: number) => px * t.space3d.metersPerPx;
	if (is3d) ensure3d();
	const W = $derived(m(width));
	const barH = $derived(m(tk.sizes[size]));
	const headerH = $derived(hasHeader ? m(font.lineHeight) * t.space3d.textScale : 0);
	const headerGap = $derived(hasHeader ? m(tk.gap) : 0);
	const box = $derived({ width: W, height: headerH + headerGap + barH });
	const slot = is3d ? useSlot(() => box) : () => ({ x: 0, y: 0 });
	// The header Texts inside are placed by hand, not by a parent Panel's stack.
	setStack(undefined);
	const barY = $derived(-box.height / 2 + barH / 2);
	const headerY = $derived(box.height / 2 - headerH / 2);
	const depth = 0.01;
	const segment = $derived(W * tk.segment);
	const sweep = $derived(
		`property: position; from: ${-W / 2} ${-barH / 2} 0.001; to: ${W / 2 - segment} ${-barH / 2} 0.001; dur: ${tk.duration}; dir: alternate; loop: true; easing: easeInOutSine`
	);
</script>

{#if is3d}
	<a-entity {...rest}>
		<a-entity position="{slot().x} {slot().y} 0">
			{#if hasHeader}
				<a-entity position="0 {headerY} 0">
					{#if label}
						<Text variant={tk.typography} text={label} align="left" position="{-W / 2} 0 0" />
					{/if}
					{#if showValue && !infinite}
						<Text variant={tk.typography} text={percent} align="right" color={t.colors.contentSecondary} position="{W / 2} 0 0" />
					{/if}
				</a-entity>
			{/if}
			<a-entity position="0 {barY} 0">
				<a-entity
					rounded="width: {W}; height: {barH}; depth: {depth}; radius: {barH / 2}; color: {t.colors.progressBar.track}"
					position="{-W / 2} {-barH / 2} 0"
				></a-entity>
				{#if infinite}
					<!-- Keyed on the sweep so a size change restarts it from the new ends. -->
					{#key sweep}
						<a-entity position="{-W / 2} {-barH / 2} 0.001" animation__sweep={sweep}>
							<a-entity rounded="width: {segment}; height: {barH}; depth: {depth}; radius: {barH / 2}; color: {fill}"></a-entity>
						</a-entity>
					{/key}
				{:else}
					<a-entity
						rounded="width: {Math.max(W * fraction, 0.0001)}; height: {barH}; depth: {depth}; radius: {barH / 2}; color: {fill}; enabled: {fraction > 0}"
						position="{-W / 2} {-barH / 2} 0.001"
					></a-entity>
				{/if}
			</a-entity>
		</a-entity>
	</a-entity>
{:else}
	<div
		class="ui-progress"
		role="progressbar"
		aria-label={label || undefined}
		aria-valuemin={0}
		aria-valuemax={max}
		aria-valuenow={infinite ? undefined : Math.min(max, Math.max(0, value))}
		style="--ui-width: {width}px; --ui-bar: {tk.sizes[size]}px; --ui-track: {t.colors.progressBar.track}; --ui-fill: {fill}; --ui-pct: {fraction * 100}%; --ui-segment: {tk.segment * 100}%; --ui-duration: {tk.duration}ms; --ui-gap: {tk.gap}px; --ui-font: {font.fontWeight} {font.fontSize}px/{font.lineHeight}px {t.typography.fontFamily}; --ui-label: {t.colors.contentPrimary}; --ui-value: {t.colors.contentSecondary}; {userStyle}"
		{...rest}
	>
		{#if hasHeader}
			<span class="header">
				<span>{label}</span>
				{#if showValue && !infinite}<span class="value">{percent}</span>{/if}
			</span>
		{/if}
		<span class="track"><span class="fill" class:infinite></span></span>
	</div>
{/if}

<style>
	.ui-progress {
		display: inline-flex;
		flex-direction: column;
		gap: var(--ui-gap);
		width: var(--ui-width);
		font: var(--ui-font);
		color: var(--ui-label);
	}
	.header {
		display: flex;
		justify-content: space-between;
	}
	.value {
		color: var(--ui-value);
		font-variant-numeric: tabular-nums;
	}
	.track {
		position: relative;
		display: block;
		height: var(--ui-bar);
		border-radius: var(--ui-bar);
		background: var(--ui-track);
		overflow: hidden;
	}
	.fill {
		position: absolute;
		inset: 0 auto 0 0;
		width: var(--ui-pct);
		border-radius: inherit;
		background: var(--ui-fill);
		transition: width 0.2s ease-out;
	}
	.fill.infinite {
		width: var(--ui-segment);
		animation: ui-progress-sweep var(--ui-duration) ease-in-out infinite alternate;
	}
	@keyframes ui-progress-sweep {
		from {
			left: 0;
		}
		to {
			left: calc(100% - var(--ui-segment));
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.fill {
			transition: none;
		}
		.fill.infinite {
			animation-duration: calc(var(--ui-duration) * 3);
		}
	}
</style>

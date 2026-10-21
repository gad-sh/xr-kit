<script lang="ts">
	// Base UI-style Tag: a small status chip ("Live", "3 players"). Not interactive.
	import { ensure3d } from './aframe';
	import { watchTextSize } from './aframe/measure';
	import { resolveTagStyle } from './component-style';
	import { getDimension, getTheme } from './context';
	import { font3d } from './fonts';
	import { useSlot } from './layout.svelte';
	import type { Dimension, TagKind, TagSize, TagVariant } from './theme';

	type Props = {
		label: string;
		kind?: TagKind;
		variant?: TagVariant;
		size?: TagSize;
		dimension?: Dimension;
		[attribute: string]: unknown;
	};

	let { label, kind, variant, size, dimension, style: userStyle = '', ...rest }: Props = $props();

	const theme = getTheme();
	const t = $derived(theme());
	const s = $derived(resolveTagStyle(t, { kind, variant, size }));
	const contextDimension = getDimension();
	// svelte-ignore state_referenced_locally
	const is3d = (dimension ?? contextDimension) === '3d';

	// ---- 3D ----
	const m = (px: number) => px * t.space3d.metersPerPx;
	if (is3d) ensure3d();
	let textWidth = $state(0);
	let labelEl: HTMLElement | undefined = $state();
	const height = $derived(m(s.height));
	const width = $derived(Math.max(height, textWidth + 2 * m(s.paddingX)));
	const slot = is3d ? useSlot(() => ({ width, height })) : () => ({ x: 0, y: 0 });
	const depth = 0.01;

	$effect(() => {
		if (labelEl) return watchTextSize(labelEl, (w) => (textWidth = w));
	});
</script>

{#if is3d}
	<a-entity {...rest}>
		<a-entity position="{slot().x} {slot().y} 0">
			<a-entity
				rounded="width: {width}; height: {height}; depth: {depth}; radius: {m(s.radius)}; color: {s.fill}"
				position="{-width / 2} {-height / 2} 0"
			></a-entity>
			<a-entity
				bind:this={labelEl}
				troika-text="value: {label.replace(/;/g, ',')}; fontSize: {m(s.font.fontSize) * t.space3d.textScale}; color: {s.text}; font: {font3d(t)}; anchor: center; baseline: center"
				troika-text-material="shader: standard"
				position="0 0 {depth + 0.002}"
			></a-entity>
		</a-entity>
	</a-entity>
{:else}
	<span
		class="ui-tag"
		style="height: {s.height}px; padding: 0 {s.paddingX}px; border-radius: {s.radius}px; background: {s.fill}; color: {s.text}; font: {s.font.fontWeight} {s.font.fontSize}px/{s.font.lineHeight}px {t.typography.fontFamily}; {userStyle}"
		{...rest}
	>
		{label}
	</span>
{/if}

<style>
	.ui-tag {
		display: inline-flex;
		align-items: center;
		box-sizing: border-box;
		white-space: nowrap;
	}
</style>

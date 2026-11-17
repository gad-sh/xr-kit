<script lang="ts">
	// Base UI-style Spinner: a rotating arc on a faint ring. 3D: a torus arc spinning in place.
	import { ensure3d } from './aframe';
	import { getDimension, getTheme } from './context';
	import { useSlot } from './layout.svelte';
	import type { Dimension, SpinnerSize } from './theme';

	type Props = {
		size?: SpinnerSize;
		color?: string;
		dimension?: Dimension;
		[attribute: string]: unknown;
	};

	let { size = 'medium', color, dimension, style: userStyle = '', ...rest }: Props = $props();

	const theme = getTheme();
	const t = $derived(theme());
	const px = $derived(t.spinner.sizes[size]);
	const thickness = $derived(Math.max(2, px * t.spinner.thickness));
	const active = $derived(color ?? t.colors.spinner.active);
	const contextDimension = getDimension();
	// svelte-ignore state_referenced_locally
	const is3d = (dimension ?? contextDimension) === '3d';

	// ---- 3D ----
	const m = (v: number) => v * t.space3d.metersPerPx;
	if (is3d) ensure3d();
	const d = $derived(m(px));
	const slot = is3d ? useSlot(() => ({ width: d, height: d })) : () => ({ x: 0, y: 0 });
	const torus = $derived(`radius: ${(d - m(thickness)) / 2}; radiusTubular: ${m(thickness) / 2}; segmentsTubular: 48`);
	const spin = $derived(`property: rotation; from: 0 0 0; to: 0 0 -360; dur: ${t.animation.timing500 * 2}; loop: true; easing: linear`);
</script>

{#if is3d}
	<a-entity {...rest}>
		<a-entity position="{slot().x} {slot().y} 0">
			<a-entity geometry="primitive: torus; {torus}" material="color: {t.colors.spinner.track}; roughness: 0.6"></a-entity>
			<a-entity
				geometry="primitive: torus; {torus}; arc: 90"
				material="color: {active}; emissive: {active}; emissiveIntensity: 0.4"
				position="0 0 0.002"
				animation__spin={spin}
			></a-entity>
		</a-entity>
	</a-entity>
{:else}
	<span
		class="ui-spinner"
		role="progressbar"
		aria-label="Loading"
		style="width: {px}px; height: {px}px; border-width: {thickness}px; border-color: {t.colors.spinner.track}; border-top-color: {active}; {userStyle}"
		{...rest}
	></span>
{/if}

<style>
	.ui-spinner {
		display: inline-block;
		box-sizing: border-box;
		border-style: solid;
		border-radius: 50%;
		animation: ui-spin 1s linear infinite;
	}
	@keyframes ui-spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>

<script lang="ts">
	// Base UI-style Slider (single value). 2D is a native <input type="range">.
	// 3D: press on the track or thumb, then the value follows the cursor ray where it
	// crosses the track's plane until release — so the drag survives drifting off the
	// track, and works the same for the mouse cursor and a VR laser.
	import { ensure3d } from './aframe';
	import { everyFrame } from './aframe/frame';
	import { sliderFraction, sliderValueAt } from './component-style';
	import { getDimension, getTheme } from './context';
	import { setStack, useSlot } from './layout.svelte';
	import Text from './Text.svelte';
	import type { Dimension } from './theme';

	type Props = {
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		label?: string;
		showValue?: boolean;
		disabled?: boolean;
		// px
		width?: number;
		onchange?: (value: number) => void;
		dimension?: Dimension;
		[attribute: string]: unknown;
	};

	const theme = getTheme();
	let {
		value = $bindable(0),
		min = 0,
		max = 100,
		step = 1,
		label = '',
		showValue = true,
		disabled = false,
		width = theme().slider.width,
		onchange,
		dimension,
		style: userStyle = '',
		...rest
	}: Props = $props();

	const t = $derived(theme());
	const c = $derived(t.colors.slider);
	const fraction = $derived(sliderFraction(value, min, max));
	const font = $derived(t.typography[t.slider.typography]);
	const hasHeader = $derived(!!label || showValue);
	const contextDimension = getDimension();
	// svelte-ignore state_referenced_locally
	const is3d = (dimension ?? contextDimension) === '3d';

	function setValue(next: number) {
		if (next === value) return;
		value = next;
		onchange?.(value);
	}

	// ---- 3D ----
	const m = (px: number) => px * t.space3d.metersPerPx;
	if (is3d) ensure3d();
	const W = $derived(m(width));
	const trackH = $derived(m(t.slider.trackHeight));
	const thumb = $derived(m(t.slider.thumb));
	const headerH = $derived(hasHeader ? m(font.lineHeight) * t.space3d.textScale : 0);
	const headerGap = $derived(hasHeader ? m(t.slider.gap) : 0);
	const size = $derived({ width: W + thumb, height: headerH + headerGap + thumb });
	const slot = is3d ? useSlot(() => size) : () => ({ x: 0, y: 0 });
	// The header Text inside is placed by hand, not by a parent Panel's stack.
	setStack(undefined);
	// Track runs through y = trackY; the header sits above it.
	const trackY = $derived(-size.height / 2 + thumb / 2);
	const headerY = $derived(size.height / 2 - headerH / 2);
	const depth = 0.01;
	const disabledColor = $derived(t.colors.buttonDisabledText);

	let trackEl: (HTMLElement & { object3D?: any }) | undefined = $state();
	let dragging = $state(false);
	let hovered = $state(false);
	const thumbScale = $derived((hovered || dragging) && !disabled ? 1.2 : 1);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function valueFromRay(ray: any) {
		const THREE = (globalThis as any).AFRAME.THREE;
		const obj = trackEl!.object3D;
		const normal = new THREE.Vector3(0, 0, 1).transformDirection(obj.matrixWorld);
		const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(normal, obj.getWorldPosition(new THREE.Vector3()));
		const hit = ray.intersectPlane(plane, new THREE.Vector3());
		if (!hit) return;
		const x = obj.worldToLocal(hit).x;
		setValue(sliderValueAt((x + W / 2) / W, min, max, step));
	}

	function startDrag(event: Event) {
		const detail = (event as CustomEvent).detail;
		const cursorEl = detail?.cursorEl;
		const raycaster = cursorEl?.components?.raycaster;
		if (disabled || !raycaster || !trackEl) return;
		dragging = true;
		valueFromRay(raycaster.raycaster.ray);
		// Not window.requestAnimationFrame: that's paused in an immersive session.
		const stopFollowing = everyFrame(cursorEl.sceneEl, () => valueFromRay(raycaster.raycaster.ray));
		const stop = () => {
			dragging = false;
			stopFollowing();
			cursorEl.removeEventListener('mouseup', stop);
			window.removeEventListener('mouseup', stop);
		};
		// The cursor emits mouseup on itself; the window listener covers a mouse released off-canvas.
		cursorEl.addEventListener('mouseup', stop);
		window.addEventListener('mouseup', stop);
	}
</script>

{#if is3d}
	<!-- svelte-ignore a11y_no_static_element_interactions, a11y_mouse_events_have_key_events -->
	<a-entity
		{...rest}
		onmousedown={startDrag}
		onmouseenter={() => (hovered = true)}
		onmouseleave={() => (hovered = false)}
	>
		<a-entity position="{slot().x} {slot().y} 0">
			{#if hasHeader}
				<a-entity position="0 {headerY} 0">
					{#if label}
						<Text variant={t.slider.typography} text={label} align="left" color={disabled ? disabledColor : undefined} position="{-W / 2} 0 0" />
					{/if}
					{#if showValue}
						<Text variant={t.slider.typography} text={String(value)} align="right" color={t.colors.contentSecondary} position="{W / 2} 0 0" />
					{/if}
				</a-entity>
			{/if}
			<a-entity bind:this={trackEl} position="0 {trackY} 0">
				<!-- Hit area: the track plus the thumb's reach, a bit taller than the thumb. -->
				<a-entity
					class={disabled ? '' : 'raycastable'}
					geometry="primitive: plane; width: {W + thumb}; height: {thumb * 1.6}"
					material="visible: false"
					position="0 0 {depth + 0.004}"
				></a-entity>
				<a-entity
					rounded="width: {W}; height: {trackH}; depth: {depth}; radius: {trackH / 2}; color: {c.track}"
					position="{-W / 2} {-trackH / 2} 0"
				></a-entity>
				<a-entity
					rounded="width: {Math.max(W * fraction, 0.0001)}; height: {trackH}; depth: {depth}; radius: {trackH / 2}; color: {disabled ? disabledColor : c.fill}; enabled: {fraction > 0}"
					position="{-W / 2} {-trackH / 2} 0.001"
				></a-entity>
				<a-entity
					geometry="primitive: cylinder; radius: {thumb / 2}; height: 0.008; segmentsRadial: 32"
					material="color: {disabled ? disabledColor : c.thumb}; roughness: 0.4"
					rotation="90 0 0"
					position="{-W / 2 + W * fraction} 0 {depth + t.space3d.raise / 2}"
					scale="{thumbScale} 1 {thumbScale}"
				></a-entity>
			</a-entity>
		</a-entity>
	</a-entity>
{:else}
	<label
		class="ui-slider"
		class:disabled
		style="--ui-width: {width}px; --ui-track: {c.track}; --ui-fill: {disabled ? t.colors.buttonDisabledFill : c.fill}; --ui-thumb: {disabled ? disabledColor : c.thumb}; --ui-thumb-size: {t.slider.thumb}px; --ui-track-height: {t.slider.trackHeight}px; --ui-pct: {fraction * 100}%; --ui-gap: {t.slider.gap}px; --ui-focus: {t.colors.accent}; --ui-font: {font.fontWeight} {font.fontSize}px/{font.lineHeight}px {t.typography.fontFamily}; --ui-label: {disabled ? disabledColor : t.colors.contentPrimary}; --ui-value: {t.colors.contentSecondary}; {userStyle}"
		{...rest}
	>
		{#if hasHeader}
			<span class="header">
				<span>{label}</span>
				{#if showValue}<span class="value">{value}</span>{/if}
			</span>
		{/if}
		<input type="range" {min} {max} {step} {disabled} bind:value oninput={() => onchange?.(value)} />
	</label>
{/if}

<style>
	.ui-slider {
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
	input {
		appearance: none;
		width: 100%;
		height: var(--ui-thumb-size);
		margin: 0;
		background: transparent;
		cursor: pointer;
	}
	.disabled input {
		cursor: not-allowed;
	}
	input::-webkit-slider-runnable-track {
		height: var(--ui-track-height);
		border-radius: var(--ui-track-height);
		background: linear-gradient(to right, var(--ui-fill) var(--ui-pct), var(--ui-track) var(--ui-pct));
	}
	input::-moz-range-track {
		height: var(--ui-track-height);
		border-radius: var(--ui-track-height);
		background: linear-gradient(to right, var(--ui-fill) var(--ui-pct), var(--ui-track) var(--ui-pct));
	}
	input::-webkit-slider-thumb {
		appearance: none;
		width: var(--ui-thumb-size);
		height: var(--ui-thumb-size);
		margin-top: calc((var(--ui-track-height) - var(--ui-thumb-size)) / 2);
		border-radius: 50%;
		background: var(--ui-thumb);
		border: 0;
	}
	input::-moz-range-thumb {
		width: var(--ui-thumb-size);
		height: var(--ui-thumb-size);
		border-radius: 50%;
		background: var(--ui-thumb);
		border: 0;
	}
	input:focus-visible::-webkit-slider-thumb {
		outline: 3px solid var(--ui-focus);
		outline-offset: 2px;
	}
	input:focus-visible::-moz-range-thumb {
		outline: 3px solid var(--ui-focus);
		outline-offset: 2px;
	}
</style>

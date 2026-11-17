<script lang="ts">
	// Base UI-style Checkbox, as a box or a toggle switch (`type="toggle"`).
	// 2D wraps a native <input type="checkbox">, so keyboard and screen readers work.
	// 3D: the whole row (control + label) is one click target for the A-Frame cursor.
	import { untrack } from 'svelte';
	import { ensure3d } from './aframe';
	import { watchTextSize } from './aframe/measure';
	import { resolveCheckboxStyle, type CheckboxType } from './component-style';
	import { getDimension, getTheme } from './context';
	import { font3d } from './fonts';
	import { useSlot } from './layout.svelte';
	import type { Dimension } from './theme';

	type Props = {
		checked?: boolean;
		label?: string;
		type?: CheckboxType;
		disabled?: boolean;
		onchange?: (checked: boolean) => void;
		dimension?: Dimension;
		[attribute: string]: unknown;
	};

	let {
		checked = $bindable(false),
		label = '',
		type = 'checkbox',
		disabled = false,
		onchange,
		dimension,
		style: userStyle = '',
		...rest
	}: Props = $props();

	const theme = getTheme();
	const t = $derived(theme());
	const s = $derived(resolveCheckboxStyle(t, { type, checked, disabled }));
	const toggle = $derived(type === 'toggle');
	const contextDimension = getDimension();
	// svelte-ignore state_referenced_locally
	const is3d = (dimension ?? contextDimension) === '3d';

	// ---- 3D ----
	const m = (px: number) => px * t.space3d.metersPerPx;
	if (is3d) ensure3d();
	let hovered = $state(false);
	let labelSize = $state({ width: 0, height: 0 });
	let labelEl: HTMLElement | undefined = $state();
	const control = $derived({ width: m(s.width), height: m(s.height) });
	const gap = $derived(label ? m(t.checkbox.gap) : 0);
	const size = $derived({
		width: control.width + gap + labelSize.width,
		height: Math.max(control.height, labelSize.height),
	});
	const slot = is3d ? useSlot(() => size) : () => ({ x: 0, y: 0 });
	const controlX = $derived(-size.width / 2 + control.width / 2);
	const depth = 0.02;
	const knobX = $derived(checked ? control.width / 2 - control.height / 2 : -control.width / 2 + control.height / 2);
	// The knob's x is driven by its animation; the position attribute only sets where it starts.
	const startKnobX = untrack(() => knobX);
	const scale = $derived(hovered && !disabled ? t.space3d.hoverScale : 1);
	const motion = $derived(`dur: ${t.animation.timing200}; easing: ${t.animation.easeOut3d}`);

	$effect(() => {
		if (labelEl) return watchTextSize(labelEl, (width, height) => (labelSize = { width, height }));
	});

	function toggleChecked() {
		if (disabled) return;
		checked = !checked;
		onchange?.(checked);
	}
</script>

{#if is3d}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions, a11y_mouse_events_have_key_events -->
	<a-entity
		{...rest}
		onclick={toggleChecked}
		onmouseenter={() => (hovered = true)}
		onmouseleave={() => (hovered = false)}
	>
		<a-entity position="{slot().x} {slot().y} 0">
			<!-- Invisible hit area over control + label (the raycaster ignores `visible`). -->
			<a-entity
				class={disabled ? '' : 'raycastable'}
				geometry="primitive: plane; width: {size.width}; height: {size.height}"
				material="visible: false"
				position="0 0 {depth}"
			></a-entity>
			<a-entity position="{controlX} 0 0" animation__uiscale="property: scale; to: {scale} {scale} 1; {motion}">
				<a-entity
					rounded="width: {control.width}; height: {control.height}; depth: {depth}; radius: {m(s.radius)}; color: {s.fill3d}"
					position="{-control.width / 2} {-control.height / 2} 0"
				></a-entity>
				{#if toggle}
					<a-entity
						geometry="primitive: cylinder; radius: {m(s.knob) / 2}; height: 0.008; segmentsRadial: 32"
						material="color: {s.knobColor}; roughness: 0.4"
						rotation="90 0 0"
						position="{startKnobX} 0 {depth + t.space3d.raise / 2}"
						animation__knob="property: object3D.position.x; to: {knobX}; {motion}"
					></a-entity>
				{:else}
					<a-entity
						visible={checked}
						troika-text="value: ✓; fontSize: {control.height * 0.95}; color: {s.mark}; font: {font3d(t)}; anchor: center; baseline: center"
						troika-text-material="shader: standard"
						position="0 0 {depth + 0.002}"
					></a-entity>
				{/if}
			</a-entity>
			{#if label}
				<a-entity
					bind:this={labelEl}
					troika-text="value: {label.replace(/;/g, ',')}; fontSize: {m(s.font.fontSize) * t.space3d.textScale}; color: {s.labelColor}; font: {font3d(t)}; anchor: left; baseline: center"
					troika-text-material="shader: standard"
					position="{-size.width / 2 + control.width + gap} 0 0.002"
				></a-entity>
			{/if}
		</a-entity>
	</a-entity>
{:else}
	<label
		class="ui-checkbox"
		class:disabled
		class:checked
		style="--ui-width: {s.width}px; --ui-height: {s.height}px; --ui-radius: {s.radius}px; --ui-fill: {s.fill}; --ui-border: {s.border}; --ui-mark: {s.mark}; --ui-knob: {s.knob}px; --ui-knob-color: {s.knobColor}; --ui-label: {s.labelColor}; --ui-gap: {t.checkbox.gap}px; --ui-focus: {t.colors.accent}; --ui-font: {s.font.fontWeight} {s.font.fontSize}px/{s.font.lineHeight}px {t.typography.fontFamily}; --ui-duration: {t.animation.timing200}ms; {userStyle}"
		{...rest}
	>
		<input
			type="checkbox"
			role={toggle ? 'switch' : undefined}
			bind:checked
			{disabled}
			onchange={() => onchange?.(checked)}
		/>
		{#if toggle}
			<span class="control track"><span class="knob"></span></span>
		{:else}
			<span class="control box">
				<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" /></svg>
			</span>
		{/if}
		{#if label}<span class="label">{label}</span>{/if}
	</label>
{/if}

<style>
	.ui-checkbox {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: var(--ui-gap);
		font: var(--ui-font);
		color: var(--ui-label);
		cursor: pointer;
		user-select: none;
	}
	.ui-checkbox.disabled {
		cursor: not-allowed;
	}
	input {
		position: absolute;
		opacity: 0;
		width: 1px;
		height: 1px;
		margin: 0;
		pointer-events: none;
	}
	.control {
		position: relative;
		box-sizing: border-box;
		flex: none;
		width: var(--ui-width);
		height: var(--ui-height);
		border-radius: var(--ui-radius);
		background: var(--ui-fill);
		border: 2px solid var(--ui-border);
		transition: background-color var(--ui-duration), border-color var(--ui-duration);
	}
	input:focus-visible + .control {
		outline: 3px solid var(--ui-focus);
		outline-offset: 2px;
	}
	.box svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		fill: none;
		stroke: var(--ui-mark);
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		opacity: 0;
		transition: opacity var(--ui-duration);
	}
	.checked .box svg {
		opacity: 1;
	}
	.track {
		border: 0;
	}
	.knob {
		position: absolute;
		top: 50%;
		left: calc((var(--ui-height) - var(--ui-knob)) / 2);
		width: var(--ui-knob);
		height: var(--ui-knob);
		border-radius: 50%;
		background: var(--ui-knob-color);
		transform: translateY(-50%);
		transition: transform var(--ui-duration);
	}
	.checked .knob {
		transform: translate(calc(var(--ui-width) - var(--ui-height)), -50%);
	}
</style>

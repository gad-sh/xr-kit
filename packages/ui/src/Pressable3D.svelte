<script lang="ts">
	// Internal 3D building block for Tabs and Menu: a clickable row with a label, an
	// optional end label (shortcut / meta), a hover background and an optional
	// underline. The parent resolves every color; this only draws and reports its size.
	import { ensure3d } from './aframe';
	import { watchTextSize } from './aframe/measure';
	import { getTheme } from './context';
	import { font3d } from './fonts';
	import { useSlot } from './layout.svelte';
	import type { Font } from './theme';

	type Props = {
		label: string;
		end?: string;
		font: Font;
		endFont?: Font;
		textColor: string;
		endColor?: string;
		// px
		height: number;
		paddingX: number;
		minWidth?: number;
		radius?: number;
		// meters: draw this wide instead of the intrinsic width (Menu makes rows equal).
		fillWidth?: number;
		align?: 'center' | 'start';
		fill?: string;
		hoverFill?: string;
		activeFill?: string;
		// Underline shown while selected (tabs).
		indicator?: { color: string; height: number };
		selected?: boolean;
		disabled?: boolean;
		onclick?: (event: Event) => void;
	};

	let {
		label,
		end,
		font,
		endFont = font,
		textColor,
		endColor = textColor,
		height,
		paddingX,
		minWidth = 0,
		radius = 0,
		fillWidth,
		align = 'center',
		fill,
		hoverFill,
		activeFill,
		indicator,
		selected = false,
		disabled = false,
		onclick,
	}: Props = $props();

	ensure3d();
	const theme = getTheme();
	const t = $derived(theme());
	const m = (px: number) => px * t.space3d.metersPerPx;

	let hovered = $state(false);
	let pressed = $state(false);
	let labelWidth = $state(0);
	let endWidth = $state(0);
	let labelEl: HTMLElement | undefined = $state();
	let endEl: HTMLElement | undefined = $state();

	const h = $derived(m(height));
	const pad = $derived(m(paddingX));
	const endGap = $derived(end ? m(16) : 0);
	const intrinsic = $derived(Math.max(m(minWidth), labelWidth + endGap + endWidth + 2 * pad));
	const w = $derived(fillWidth ?? intrinsic);
	const slot = useSlot(() => ({ width: intrinsic, height: h }));

	const background = $derived(disabled ? undefined : pressed ? activeFill : hovered ? hoverFill : fill);
	const text = (value: string, f: Font, color: string, anchor: string) =>
		`value: ${value.replace(/;/g, ',')}; fontSize: ${m(f.fontSize) * t.space3d.textScale}; color: ${color}; font: ${font3d(t)}; anchor: ${anchor}; baseline: center`;

	$effect(() => {
		if (!disabled) return;
		hovered = pressed = false;
	});
	$effect(() => {
		if (labelEl) return watchTextSize(labelEl, (width) => (labelWidth = width));
	});
	$effect(() => {
		if (endEl) return watchTextSize(endEl, (width) => (endWidth = width));
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions, a11y_mouse_events_have_key_events -->
<a-entity
	position="{slot().x} {slot().y} 0"
	onclick={(event: Event) => !disabled && onclick?.(event)}
	onmouseenter={() => !disabled && (hovered = true)}
	onmouseleave={() => (hovered = pressed = false)}
	onmousedown={() => !disabled && (pressed = true)}
	onmouseup={() => (pressed = false)}
>
	<a-entity
		class={disabled ? '' : 'raycastable'}
		geometry="primitive: plane; width: {w}; height: {h}"
		material="visible: false"
		position="0 0 0.006"
	></a-entity>
	<a-entity
		rounded="flat: true; width: {w}; height: {h}; radius: {Math.min(m(radius), h / 2)}; color: {background ?? '#000000'}; enabled: {!!background}"
		position="{-w / 2} {-h / 2} 0.001"
	></a-entity>
	{#if indicator}
		<a-entity
			rounded="flat: true; width: {w}; height: {m(indicator.height)}; radius: {m(indicator.height) / 2}; color: {indicator.color}; enabled: {selected}"
			position="{-w / 2} {-h / 2} 0.002"
		></a-entity>
	{/if}
	<a-entity
		bind:this={labelEl}
		troika-text={text(label, font, textColor, align === 'start' ? 'left' : 'center')}
		troika-text-material="shader: standard"
		position="{align === 'start' ? -w / 2 + pad : end ? -(endGap + endWidth) / 2 : 0} 0 0.004"
	></a-entity>
	{#if end}
		<a-entity
			bind:this={endEl}
			troika-text={text(end, endFont, endColor, 'right')}
			troika-text-material="shader: standard"
			position="{w / 2 - pad} 0 0.004"
		></a-entity>
	{/if}
</a-entity>

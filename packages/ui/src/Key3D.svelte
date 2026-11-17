<script lang="ts">
	// Internal: one key of the VR keyboard. Fixed size, centered on its position.
	// Hover lightens it and lifts it toward you; pressing (cursor down) sinks it and turns it
	// white, held for a moment so a quick trigger pull still shows; a press also pulses
	// the controller that made it.
	import { onDestroy } from 'svelte';
	import { setTroikaValue } from './aframe/measure';
	import { resolveKeyStyle } from './component-style';
	import { getTheme } from './context';
	import { font3d } from './fonts';
	import type { Font } from './theme';

	type Props = {
		label: string;
		// meters
		width: number;
		height: number;
		font: Font;
		kind?: 'char' | 'special' | 'accent';
		// Latched (shift / caps).
		on?: boolean;
		onpress: (event: Event) => void;
	};

	let { label, width, height, font, kind = 'char', on = false, onpress }: Props = $props();

	const theme = getTheme();
	const t = $derived(theme());
	const m = (px: number) => px * t.space3d.metersPerPx;
	let hovered = $state(false);
	let pressed = $state(false);
	let releaseTimer: ReturnType<typeof setTimeout> | undefined;
	onDestroy(() => clearTimeout(releaseTimer));

	const s = $derived(resolveKeyStyle(t, { kind, hovered, pressed, on }));
	const depth = 0.03;
	const z = $derived(pressed ? -t.space3d.pressDepth : hovered ? 0.008 : 0);

	let labelEl: HTMLElement | undefined = $state();
	$effect(() => setTroikaValue(labelEl, label));

	function down(event: Event) {
		clearTimeout(releaseTimer);
		pressed = true;
		pulse((event as CustomEvent).detail?.cursorEl);
	}
	function up() {
		releaseTimer = setTimeout(() => (pressed = false), 90);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function pulse(cursorEl: any) {
		try {
			cursorEl?.components?.['tracked-controls']?.controller?.gamepad?.hapticActuators?.[0]?.pulse?.(0.25, 18);
		} catch {
			// No haptics on this device.
		}
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions, a11y_mouse_events_have_key_events -->
<a-entity
	position="0 0 {z}"
	onclick={onpress}
	onmouseenter={() => (hovered = true)}
	onmouseleave={() => {
		hovered = false;
		up();
	}}
	onmousedown={down}
	onmouseup={up}
>
	<a-entity
		class="raycastable"
		rounded="width: {width}; height: {height}; depth: {depth}; radius: {m(t.keyboard.radius)}; color: {s.fill}"
		position="{-width / 2} {-height / 2} 0"
	></a-entity>
	<a-entity
		bind:this={labelEl}
		troika-text="fontSize: {m(font.fontSize) * t.space3d.textScale}; color: {s.text}; font: {font3d(t)}; anchor: center; baseline: center"
		troika-text-material="shader: standard"
		position="0 0 {depth + 0.002}"
	></a-entity>
</a-entity>

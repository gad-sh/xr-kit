<script lang="ts">
	// Internal: one line of editable text in 3D — troika text clipped to a window, a
	// blinking caret, a placeholder, and horizontal scroll that keeps the caret in view.
	// Clicking it reports the caret index under the cursor (`onpick`). Used by Input's
	// field and the VR keyboard's preview line. Centered on its position.
	import { onDestroy } from 'svelte';
	import { setTroikaValue, watchTextLayout } from './aframe/measure';
	import { getTheme } from './context';
	import { font3d } from './fonts';
	import { caretIndexAt, caretX, scrollToCaret } from './text-edit';
	import type { Font } from './theme';

	type Props = {
		text: string;
		caret: number;
		// Show the (blinking) caret.
		focused?: boolean;
		placeholder?: string;
		font: Font;
		color: string;
		placeholderColor: string;
		caretColor: string;
		// meters: the visible window, and the clickable area around it.
		width: number;
		hitWidth?: number;
		hitHeight?: number;
		interactive?: boolean;
		onpick?: (index: number) => void;
	};

	let {
		text,
		caret,
		focused = false,
		placeholder = '',
		font,
		color,
		placeholderColor,
		caretColor,
		width,
		hitWidth = width,
		hitHeight,
		interactive = true,
		onpick,
	}: Props = $props();

	const theme = getTheme();
	const t = $derived(theme());
	const m = (px: number) => px * t.space3d.metersPerPx;
	const fontSize = $derived(m(font.fontSize) * t.space3d.textScale);
	const lineHeight = $derived(m(font.lineHeight) * t.space3d.textScale);

	let textEl: HTMLElement | undefined = $state();
	let placeholderEl: HTMLElement | undefined = $state();
	// troika's caret positions for the text as last laid out (it lays out asynchronously).
	let positions = $state.raw<ArrayLike<number> | null>(null);
	const laidOut = $derived(positions ? positions.length / 4 : 0);
	const caretAt = $derived(caretX(Math.min(caret, laidOut), positions, laidOut));
	const textWidth = $derived(caretX(laidOut, positions, laidOut));
	let scroll = $state(0);
	$effect(() => {
		scroll = scrollToCaret(caretAt, scroll, width, textWidth);
	});

	$effect(() => {
		if (textEl) return watchTextLayout(textEl, (info) => (positions = info.caretPositions ?? null));
	});
	$effect(() => setTroikaValue(textEl, text));
	$effect(() => setTroikaValue(placeholderEl, placeholder));

	// Blink, solid again whenever the text or caret moves. A timer, not
	// requestAnimationFrame, so it keeps going in an immersive session.
	let blinkOn = $state(true);
	let timer: ReturnType<typeof setInterval> | undefined;
	$effect(() => {
		void text;
		void caret;
		blinkOn = true;
		clearInterval(timer);
		if (focused) timer = setInterval(() => (blinkOn = !blinkOn), 530);
	});
	onDestroy(() => clearInterval(timer));

	const common = $derived(
		`fontSize: ${fontSize}; color: ${color}; font: ${font3d(t)}; anchor: left; baseline: center; whiteSpace: nowrap`
	);

	function pick(event: Event) {
		const point = (event as CustomEvent).detail?.intersection?.point;
		const obj = (textEl as any)?.object3D;
		if (!point || !obj || !onpick) return;
		const x = obj.worldToLocal(point.clone()).x;
		onpick(caretIndexAt(x, positions, laidOut));
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<a-entity onclick={pick}>
	<!-- Hit area (the raycaster ignores `visible`). -->
	<a-entity
		class={interactive ? 'raycastable' : ''}
		geometry="primitive: plane; width: {hitWidth}; height: {hitHeight ?? lineHeight * 1.6}"
		material="visible: false"
		position="0 0 0.003"
	></a-entity>
	<a-entity
		bind:this={textEl}
		troika-text="{common}; clipRect: {scroll} {-lineHeight} {scroll + width} {lineHeight}"
		troika-text-material="shader: standard"
		position="{-width / 2 - scroll} 0 0.001"
	></a-entity>
	{#if !text && placeholder}
		<a-entity
			bind:this={placeholderEl}
			troika-text="{common}; color: {placeholderColor}; clipRect: 0 {-lineHeight} {width} {lineHeight}"
			troika-text-material="shader: standard"
			position="{-width / 2} 0 0.001"
		></a-entity>
	{/if}
	{#if focused}
		<a-entity
			geometry="primitive: plane; width: {m(t.input.caretWidth) * t.space3d.textScale}; height: {fontSize * 1.25}"
			material="shader: flat; color: {caretColor}; opacity: {blinkOn ? 1 : 0}; transparent: true"
			position="{-width / 2 + caretAt - scroll} 0 0.002"
		></a-entity>
	{/if}
</a-entity>

<script lang="ts">
	// Base UI-style Tooltip: a short hint that appears while the pointer rests on its trigger.
	//   <Tooltip content="Copies the invite link"><Button label="Start call" /></Tooltip>
	// After `delay` ms of hover (or right away on keyboard focus, in 2D); `bind:open` to
	// show it yourself. 3D: the trigger keeps its place in the parent layout and the
	// bubble floats in front of it, so a mouse cursor or a VR laser resting on it shows it.
	import type { Snippet } from 'svelte';
	import { ensure3d } from './aframe';
	import { watchTextSize } from './aframe/measure';
	import { tooltipOffset } from './component-style';
	import { getDimension, getTheme } from './context';
	import { font3d } from './fonts';
	import { createStack, setStack, useSlot } from './layout.svelte';
	import type { Dimension, TooltipPlacement } from './theme';

	type Props = {
		content: string;
		children: Snippet;
		placement?: TooltipPlacement;
		open?: boolean;
		// ms before it shows on hover.
		delay?: number;
		dimension?: Dimension;
		[attribute: string]: unknown;
	};

	const theme = getTheme();
	let {
		content,
		children,
		placement = 'top',
		open = $bindable(false),
		delay = theme().tooltip.delay,
		dimension,
		style: userStyle = '',
		...rest
	}: Props = $props();

	const t = $derived(theme());
	const tk = $derived(t.tooltip);
	const c = $derived(t.colors.tooltip);
	const font = $derived(t.typography[tk.typography]);
	const contextDimension = getDimension();
	// svelte-ignore state_referenced_locally
	const is3d = (dimension ?? contextDimension) === '3d';
	const id = `ui-tooltip-${Math.random().toString(36).slice(2, 9)}`;

	let timer: ReturnType<typeof setTimeout> | undefined;
	function show(now = false) {
		clearTimeout(timer);
		if (now || delay <= 0) open = true;
		else timer = setTimeout(() => (open = true), delay);
	}
	function hide() {
		clearTimeout(timer);
		open = false;
	}
	$effect(() => () => clearTimeout(timer));
	$effect(() => {
		if (!open) return;
		const onkey = (event: KeyboardEvent) => event.key === 'Escape' && hide();
		window.addEventListener('keydown', onkey);
		return () => window.removeEventListener('keydown', onkey);
	});

	// ---- 3D ----
	const m = (px: number) => px * t.space3d.metersPerPx;
	if (is3d) ensure3d();
	// The trigger lays out in a stack of its own, which tells us its size; this takes its
	// place in the parent's layout like the trigger would have.
	const stack = is3d ? createStack(() => ({ direction: 'row', gap: 0, align: 'center' })) : undefined;
	const slot = is3d ? useSlot(() => stack!.size) : () => ({ x: 0, y: 0 });
	setStack(stack);

	let textEl: HTMLElement | undefined = $state();
	let textSize = $state({ width: 0, height: 0 });
	$effect(() => {
		if (textEl) return watchTextSize(textEl, (width, height) => (textSize = { width, height }));
	});
	const bubble = $derived({ width: textSize.width + 2 * m(tk.paddingX), height: textSize.height + 2 * m(tk.paddingY) });
	const at = $derived(tooltipOffset(placement, stack?.size ?? { width: 0, height: 0 }, bubble, m(tk.gap)));
	// In front of the trigger (and a hovered, lifted button), so nothing covers it.
	const lift = $derived(t.space3d.depth + t.space3d.pressDepth + 0.01);
	const bubbleDepth = 0.008;
</script>

{#if is3d}
	<!-- svelte-ignore a11y_no_static_element_interactions, a11y_mouse_events_have_key_events -->
	<a-entity {...rest} onmouseenter={() => show()} onmouseleave={hide}>
		<a-entity position="{slot().x} {slot().y} 0">
			<!-- Hover target for triggers that aren't interactive themselves (an Avatar, a Tag):
			     the cursor only reports .raycastable meshes. Just behind the trigger, so a
			     Button in front still gets its own hover and clicks. -->
			<a-entity
				class="raycastable"
				geometry="primitive: plane; width: {stack?.size.width ?? 0}; height: {stack?.size.height ?? 0}"
				material="visible: false"
				position="0 0 -0.002"
			></a-entity>
			{@render children()}
			<!-- Always there (hidden), so its text is measured before it first shows. Not raycastable,
			     so it never takes the hover from its trigger. -->
			<a-entity visible={open && textSize.width > 0} position="{at.x} {at.y} {lift}">
				<a-entity
					rounded="width: {bubble.width}; height: {bubble.height}; depth: {bubbleDepth}; radius: {Math.min(m(tk.radius), bubble.height / 2)}; color: {c.fill}"
					position="{-bubble.width / 2} {-bubble.height / 2} 0"
				></a-entity>
				<a-entity
					bind:this={textEl}
					troika-text="value: {content.replace(/;/g, ',')}; fontSize: {m(font.fontSize) * t.space3d.textScale}; lineHeight: {font.lineHeight / font.fontSize}; maxWidth: {m(tk.maxWidth)}; color: {c.text}; font: {font3d(t)}; anchor: center; baseline: center; align: center"
					troika-text-material="shader: standard"
					position="0 0 {bubbleDepth + 0.002}"
				></a-entity>
			</a-entity>
		</a-entity>
	</a-entity>
{:else}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<span
		class="ui-tooltip"
		aria-describedby={open ? id : undefined}
		onmouseenter={() => show()}
		onmouseleave={hide}
		onfocusin={() => show(true)}
		onfocusout={hide}
		style={userStyle as string}
		{...rest}
	>
		{@render children()}
		{#if open}
			<span
				{id}
				role="tooltip"
				class="bubble"
				data-placement={placement}
				style="--ui-fill: {c.fill}; --ui-text: {c.text}; --ui-pad: {tk.paddingY}px {tk.paddingX}px; --ui-radius: {tk.radius}px; --ui-gap: {tk.gap}px; --ui-max: {tk.maxWidth}px; --ui-font: {font.fontWeight} {font.fontSize}px/{font.lineHeight}px {t.typography.fontFamily};"
			>
				{content}
			</span>
		{/if}
	</span>
{/if}

<style>
	.ui-tooltip {
		position: relative;
		display: inline-flex;
	}
	.bubble {
		position: absolute;
		z-index: 1100;
		width: max-content;
		max-width: var(--ui-max);
		padding: var(--ui-pad);
		border-radius: var(--ui-radius);
		background: var(--ui-fill);
		color: var(--ui-text);
		font: var(--ui-font);
		text-align: center;
		pointer-events: none;
		animation: ui-tooltip-in 0.12s ease-out;
	}
	[data-placement='top'] {
		bottom: calc(100% + var(--ui-gap));
		left: 50%;
		translate: -50% 0;
	}
	[data-placement='bottom'] {
		top: calc(100% + var(--ui-gap));
		left: 50%;
		translate: -50% 0;
	}
	[data-placement='left'] {
		right: calc(100% + var(--ui-gap));
		top: 50%;
		translate: 0 -50%;
	}
	[data-placement='right'] {
		left: calc(100% + var(--ui-gap));
		top: 50%;
		translate: 0 -50%;
	}
	@keyframes ui-tooltip-in {
		from {
			opacity: 0;
		}
	}
</style>

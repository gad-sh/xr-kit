<script lang="ts">
	// A radial (pie) menu: hold to open, aim at a wedge, release to pick.
	//   <RadialMenu items={emotes} onselect={(item, i) => …} hotkey="e" />                 (desktop)
	//   <RadialMenu items={emotes} onselect={…} controller="#leftHand" hand="left" dimension="3d" />  (VR)
	// Same `items` as Menu (dividers are skipped). Ways to drive it:
	//   VR: `controller` — `openOn` (trigger down) opens, the thumbstick aims, `closeOn` picks.
	//   Desktop: hold `hotkey`; the ring opens at the pointer, moving the pointer aims,
	//            releasing picks. Clicking or hovering a wedge (mouse or 3D cursor/laser) works too.
	//   Keyboard while open: arrows move around the ring, Enter picks, Escape cancels.
	//   Or control it yourself with `bind:open`.
	import { untrack } from 'svelte';
	import { ensure3d } from './aframe';
	import { getDimension, getTheme } from './context';
	import { font3d } from './fonts';
	import type { MenuItem } from './Menu.svelte';
	import { ON_CONTROLLER, polar, RadialInput, sectorAngle, sectorPath, wedgeCenter, type Hand } from './radial-math';
	import StackScope from './StackScope.svelte';
	import type { Dimension } from './theme';

	type Item = Exclude<MenuItem, { divider: true }>;

	type Props = {
		items: MenuItem[];
		onselect?: (item: Item, index: number) => void;
		open?: boolean;
		disabled?: boolean;
		// Degrees counterclockwise from right where wedge 0 starts; default centres it at the top.
		startAngle?: number;
		// Thumbstick only: rotates which wedge the stick points at, for a ring that's
		// rotated on the hand. With `controller`, this and the transform default to ON_CONTROLLER[hand].
		angleOffset?: number;
		// Thumbstick travel (0–1) before a wedge is picked.
		deadzone?: number;
		controller?: string;
		// Which hand `controller` is, for the default placement (mirrored for the left).
		hand?: Hand;
		openOn?: string;
		closeOn?: string;
		hotkey?: string;
		// px
		radius?: number;
		innerRadius?: number;
		// 3D: degrees to turn the labels so they read upright on a rotated ring.
		labelRotation?: number;
		dimension?: Dimension;
		[attribute: string]: unknown;
	};

	const theme = getTheme();
	let {
		items,
		onselect,
		open = $bindable(false),
		disabled = false,
		startAngle,
		angleOffset,
		deadzone = 0.5,
		controller,
		hand = 'right',
		openOn = 'triggerdown',
		closeOn = 'triggerup',
		hotkey,
		radius,
		innerRadius,
		labelRotation,
		dimension,
		...rest
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	const onController = dimension !== '2d' && !!controller;
	// svelte-ignore state_referenced_locally
	const defaults = ON_CONTROLLER[hand];
	const fallback = (key: keyof typeof defaults) => (onController ? defaults[key] : undefined);
	const ringRadius = $derived(radius ?? (fallback('radius') as number | undefined) ?? theme().radial.radius);
	const stickOffset = $derived(angleOffset ?? (fallback('angleOffset') as number | undefined) ?? 0);
	const labelTurn = $derived(labelRotation ?? (fallback('labelRotation') as number | undefined) ?? 0);
	const placement = $derived({
		position: rest.position ?? fallback('position'),
		rotation: rest.rotation ?? fallback('rotation'),
	});

	const t = $derived(theme());
	const c = $derived(t.colors.radial);
	const wedges = $derived(items.filter((item): item is Item => !('divider' in item)));
	const layout = $derived({
		count: wedges.length,
		startAngle: startAngle ?? (fallback('startAngle') as number | undefined) ?? 90 - sectorAngle(Math.max(1, wedges.length)) / 2,
	});
	const inner = $derived(
		innerRadius ?? (fallback('innerRadius') as number | undefined) ?? ringRadius * (t.radial.innerRadius / t.radial.radius)
	);
	const font = $derived(t.typography[t.radial.typography]);
	const contextDimension = getDimension();
	// svelte-ignore state_referenced_locally
	const is3d = (dimension ?? contextDimension) === '3d';
	if (is3d) ensure3d();

	// ---- input (shared) ----
	const input = new RadialInput({ count: 0, startAngle: 0 }, 0.5);
	let selected = $state(-1);
	$effect(() => {
		input.layout = layout;
		input.disabled = (i) => !!wedges[i]?.disabled;
	});

	let pointer = { x: innerWidth / 2, y: innerHeight / 2 };
	let center = $state({ x: 0, y: 0 });

	function begin() {
		if (disabled || input.open) return;
		input.start();
		selected = -1;
		center = clampToView(pointer);
		open = true;
	}
	function sync() {
		selected = input.selected;
	}
	function finish() {
		const index = input.release();
		selected = -1;
		open = false;
		if (index >= 0) onselect?.(wedges[index], index);
	}
	function cancel() {
		input.cancel();
		selected = -1;
		open = false;
	}

	// `bind:open` from outside opens/closes it too (closing that way picks nothing).
	$effect(() => {
		const wanted = open;
		untrack(() => {
			if (wanted && !input.open) begin();
			if (!wanted && input.open) cancel();
		});
	});

	function clampToView(p: { x: number; y: number }) {
		const r = ringRadius + 8;
		return {
			x: Math.min(Math.max(p.x, r), innerWidth - r),
			y: Math.min(Math.max(p.y, r), innerHeight - r),
		};
	}

	// ---- desktop: hotkey, pointer, keyboard ----
	const typing = (e: Event) => (e.target as HTMLElement)?.closest?.('input, textarea, [contenteditable]');
	function onkeydown(event: KeyboardEvent) {
		if (hotkey && event.key.toLowerCase() === hotkey.toLowerCase() && !event.repeat && !typing(event)) begin();
		if (!input.open) return;
		const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? -1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? 1 : 0;
		if (step) {
			event.preventDefault();
			// Left / Up go counterclockwise, Right / Down clockwise, skipping disabled wedges.
			const n = wedges.length;
			let i = selected;
			for (let k = 0; k < n; k++) {
				i = i < 0 ? (step > 0 ? 0 : n - 1) : (i + step + n) % n;
				if (!wedges[i].disabled) {
					input.point(i);
					break;
				}
			}
			sync();
		} else if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			finish();
		} else if (event.key === 'Escape') {
			cancel();
		}
	}
	function onkeyup(event: KeyboardEvent) {
		if (hotkey && input.open && event.key.toLowerCase() === hotkey.toLowerCase()) finish();
	}
	function onpointermove(event: PointerEvent) {
		pointer = { x: event.clientX, y: event.clientY };
		if (is3d || !input.open) return;
		// Pointer offset from the centre, scaled so the deadzone matches the stick's 0.5.
		const scale = 2 * t.radial.deadzone;
		input.aim((event.clientX - center.x) / scale, -(event.clientY - center.y) / scale);
		sync();
	}

	// ---- VR: controller trigger + thumbstick ----
	let controllerEl: Element | null = null;
	// On a controller, the stick aims. Ignore cursors that would fight it: a laser on the same
	// controller (it passes through its own ring), and the scene's mouse cursor during an XR
	// session (A-Frame keeps its ray active in VR, so it can rest on the ring).
	const fromOwnController = (event: Event) => {
		if (!controllerEl) return false;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const cursorEl = (event as CustomEvent).detail?.cursorEl as any;
		return cursorEl === controllerEl || (cursorEl?.isScene && !!cursorEl.xrSession);
	};
	$effect(() => {
		if (!is3d || !controller) return;
		const el = document.querySelector(controller);
		controllerEl = el;
		if (!el) return;
		const onOpen = () => begin();
		const onClose = () => input.open && finish();
		const onStick = (event: Event) => {
			const { x, y } = (event as CustomEvent).detail;
			// Stick forward is -y.
			input.aim(x, -y, stickOffset);
			sync();
		};
		el.addEventListener(openOn, onOpen);
		el.addEventListener(closeOn, onClose);
		el.addEventListener('thumbstickmoved', onStick);
		return () => {
			el.removeEventListener(openOn, onOpen);
			el.removeEventListener(closeOn, onClose);
			el.removeEventListener('thumbstickmoved', onStick);
		};
	});

	// ---- 3D drawing ----
	const m = (px: number) => px * t.space3d.metersPerPx;
	const R = $derived(m(ringRadius));
	const r = $derived(m(inner));
	const labelSize3d = $derived(Math.min(m(font.fontSize) * t.space3d.textScale, R * 0.5));
	const labelSize2d = $derived(Math.min(font.fontSize, ringRadius * 0.5));
	const labelAt = (i: number) => polar((ringRadius + inner) / 2, wedgeCenter(i, layout));
	const motion = $derived(`dur: ${t.animation.timing100}; easing: ${t.animation.easeOut3d}`);
	const colorOf = (i: number) => (i === selected ? c.active : c.fill);
	const textOf = (i: number) => (wedges[i].disabled ? c.disabledText : c.text);
</script>

<svelte:window {onkeydown} {onkeyup} {onpointermove} />

{#if is3d}
	<StackScope>
		<a-entity {...rest} position={placement.position} rotation={placement.rotation} visible={open}>
			<!-- Backing ring, for depth. -->
			<a-entity
				geometry="primitive: ring; radiusInner: {r * 0.85}; radiusOuter: {R * 1.04}; segmentsTheta: 48"
				material="color: {c.ring}; opacity: 0.85; transparent: true; side: double"
				position="0 0 -{m(4)}"
			></a-entity>
			{#each wedges as item, i}
				{@const raised = i === selected}
				<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions, a11y_mouse_events_have_key_events -->
				<a-entity
					class={open && !item.disabled ? 'raycastable' : ''}
					geometry="primitive: ring; radiusInner: {r}; radiusOuter: {R}; thetaStart: {layout.startAngle + i * sectorAngle(layout.count) + t.radial.gap / 2}; thetaLength: {sectorAngle(layout.count) - t.radial.gap}; segmentsTheta: 16"
					material="color: {colorOf(i)}; side: double; roughness: 0.6"
					animation__pop="property: object3D.position.z; to: {raised ? t.space3d.raise : 0}; {motion}"
					animation__grow="property: scale; to: {raised ? 1.06 : 1} {raised ? 1.06 : 1} 1; {motion}"
					onmouseenter={(event: Event) => {
						if (fromOwnController(event)) return;
						input.point(i);
						sync();
					}}
					onclick={(event: Event) => {
						if (fromOwnController(event)) return;
						input.point(i);
						if (input.selected === i) finish();
					}}
				>
					<a-entity
						troika-text="value: {item.label.replace(/;/g, ',')}; fontSize: {labelSize3d}; color: {textOf(i)}; font: {font3d(t)}; anchor: center; baseline: center"
						troika-text-material="shader: standard"
						position="{m(labelAt(i)[0])} {m(labelAt(i)[1])} 0.003"
						rotation="0 0 {labelTurn}"
					></a-entity>
				</a-entity>
			{/each}
		</a-entity>
	</StackScope>
{:else if open}
	<div
		class="ui-radial"
		role="menu"
		aria-label="Radial menu"
		style="left: {center.x}px; top: {center.y}px; --ui-size: {ringRadius * 2}px; --ui-fill: {c.fill}; --ui-active: {c.active}; --ui-text: {c.text}; --ui-disabled: {c.disabledText}; --ui-ring: {c.ring}; --ui-font: {font.fontWeight} {labelSize2d}px/1 {t.typography.fontFamily};"
	>
		<svg viewBox="{-ringRadius - 6} {-ringRadius - 6} {ringRadius * 2 + 12} {ringRadius * 2 + 12}" aria-hidden="true">
			<circle r={ringRadius + 4} class="ring" />
		</svg>
		<svg viewBox="{-ringRadius - 6} {-ringRadius - 6} {ringRadius * 2 + 12} {ringRadius * 2 + 12}">
			{#each wedges as item, i}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<path
					d={sectorPath(i, layout, inner, ringRadius, t.radial.gap)}
					role="menuitem"
					tabindex="-1"
					aria-label={item.label}
					aria-disabled={item.disabled}
					class:active={i === selected}
					class:disabled={item.disabled}
					onpointerenter={() => {
						input.point(i);
						sync();
					}}
					onclick={() => {
						input.point(i);
						if (input.selected === i) finish();
					}}
				/>
			{/each}
		</svg>
		{#each wedges as item, i}
			<span
				class="label"
				class:disabled={item.disabled}
				style="left: calc(50% + {labelAt(i)[0]}px); top: calc(50% - {labelAt(i)[1]}px);">{item.label}</span
			>
		{/each}
	</div>
{/if}

<style>
	.ui-radial {
		position: fixed;
		z-index: 950;
		width: calc(var(--ui-size) + 12px);
		height: calc(var(--ui-size) + 12px);
		transform: translate(-50%, -50%);
		animation: ui-radial-in 0.15s cubic-bezier(0.2, 0.8, 0.4, 1);
		user-select: none;
	}
	svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
	}
	.ring {
		fill: none;
		stroke: var(--ui-ring);
		stroke-width: 8;
		opacity: 0.6;
	}
	path {
		fill: var(--ui-fill);
		stroke: none;
		cursor: pointer;
		transition: fill 0.1s, transform 0.1s;
		transform-origin: 0 0;
	}
	path.active {
		fill: var(--ui-active);
		transform: scale(1.05);
	}
	path.disabled {
		cursor: not-allowed;
		fill-opacity: 0.5;
	}
	.label {
		position: absolute;
		transform: translate(-50%, -50%);
		font: var(--ui-font);
		color: var(--ui-text);
		pointer-events: none;
		white-space: nowrap;
	}
	.label.disabled {
		color: var(--ui-disabled);
		/* Emoji ignore color. */
		opacity: 0.35;
	}
	@keyframes ui-radial-in {
		from {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.85);
		}
	}
</style>

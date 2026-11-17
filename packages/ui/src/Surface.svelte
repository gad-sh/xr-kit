<script lang="ts" module>
	export type SurfacePlacement = 'world' | 'follow' | 'hand';
	export type SurfaceDesktopPlacement = 'screen' | 'camera';
	export type ScreenRegion =
		| 'top-left'
		| 'top'
		| 'top-right'
		| 'left'
		| 'center'
		| 'right'
		| 'bottom-left'
		| 'bottom'
		| 'bottom-right';

	// One fixed region per screen spot, shared by every Surface placed there (they stack).
	function region(screen: ScreenRegion): HTMLElement {
		let el = document.querySelector<HTMLElement>(`.ui-surface-region[data-screen="${screen}"]`);
		if (!el) {
			el = document.createElement('div');
			el.className = 'ui-surface-region';
			el.dataset.screen = screen;
			document.body.appendChild(el);
		}
		return el;
	}

	// Moves the 2D content out of the <a-scene> into its screen region (or a target element).
	function portal(node: HTMLElement, where: { screen: ScreenRegion; target?: string }) {
		const place = ({ screen, target }: typeof where) =>
			((target && document.querySelector(target)) || region(screen)).appendChild(node);
		place(where);
		return { update: place, destroy: () => node.remove() };
	}
</script>

<script lang="ts">
	// A piece of UI that's HTML on a screen and 3D in a headset — the "responsive" unit
	// of a web + VR page. Put it inside the <a-scene> (not under the camera):
	//   <Surface screen="bottom" vr="follow"><Panel>…</Panel></Surface>
	// Not immersive, placed by `desktop`:
	//   screen — HTML in a fixed screen region (`screen`), or inside `target`
	//   camera — 3D, fixed in front of the camera (`offset`), like a 3D desktop menu
	// Immersive (xr.immersive: a headset session, or xr.simulated): 3D, placed by `vr`:
	//   world  — at this Surface's own position/rotation
	//   follow — lazily follows the head (distance / height / side / maxAngle)
	//   hand   — attached to a controller (`hand`, `handPosition`, `handRotation`);
	//            falls back to follow when simulating on desktop (no controllers)
	// `open` slides it in and out (in 3D the content is removed once it has slid away).
	import type { Snippet } from 'svelte';
	import { untrack } from 'svelte';
	import { fly } from 'svelte/transition';
	import { ensure3d } from './aframe';
	import { surfacePlacement, type DesktopPlacement, type VRPlacement } from './aframe/placement';
	import { getTheme } from './context';
	import DimensionScope from './DimensionScope.svelte';
	import StackScope from './StackScope.svelte';
	import { xr } from './xr.svelte';

	type Props = {
		children: Snippet;
		vr?: VRPlacement;
		desktop?: DesktopPlacement;
		screen?: ScreenRegion;
		// CSS selector to render the HTML version into, instead of a screen region.
		target?: string;
		// 'auto' follows xr.immersive; '2d' pins HTML, '3d' pins the `vr` placement.
		mode?: 'auto' | '2d' | '3d';
		open?: boolean;
		// camera: the camera entity, and where in front of it (meters, camera space)
		camera?: string;
		offset?: string;
		// follow
		distance?: number;
		height?: number;
		side?: number;
		maxAngle?: number;
		// hand
		hand?: string;
		handPosition?: string;
		handRotation?: string;
		// 3D size relative to the components' desktop size (they're sized for ~1 m on a screen).
		// In VR: default 0.45, hand surfaces half that. In front of the desktop camera: `desktopScale`, default 1.
		scale?: number;
		desktopScale?: number;
		// Extra depth: z is scaled this much more than x/y (slab thickness, layer gaps,
		// raised parts). Default 1; hand surfaces default to 2 so small panels still read as 3D.
		depthScale?: number;
		[attribute: string]: unknown;
	};

	let {
		children,
		vr = 'follow',
		desktop = 'screen',
		screen = 'bottom',
		target,
		mode = 'auto',
		open = true,
		camera = '[camera]',
		offset = '0 -0.5 -1',
		distance = 1.1,
		height = -0.25,
		side = 0,
		maxAngle = 30,
		hand = '#leftHand',
		// Ahead of and just above the controller, clear of its model.
		handPosition = '0 0.06 -0.15',
		handRotation = '-60 0 0',
		scale,
		desktopScale = 1,
		depthScale,
		...rest
	}: Props = $props();

	ensure3d();
	const theme = getTheme();
	let anchor: (HTMLElement & { sceneEl?: unknown }) | undefined = $state();
	$effect(() => {
		if (anchor) xr.watch(anchor.sceneEl ?? anchor.closest('a-scene'));
	});

	const placement = $derived(
		mode === '2d'
			? 'screen'
			: surfacePlacement({ vr, desktop }, { immersive: xr.immersive || mode === '3d', presenting: xr.presenting })
	);
	const is3d = $derived(placement !== 'screen');
	const size = $derived(placement === 'camera' ? desktopScale : (scale ?? (vr === 'hand' ? 0.225 : 0.45)));
	const depth = $derived(size * (depthScale ?? (vr === 'hand' && placement !== 'camera' ? 2 : 1)));
	// Simulated wrist menus sit off to the side instead of dead ahead.
	const followSide = $derived(vr === 'hand' && placement === 'follow' ? side || -0.45 : side);
	const followAttr = $derived(
		`distance: ${distance}; height: ${height}; side: ${followSide}; maxAngle: ${maxAngle}`
	);

	// 3D open/close: slide up into place / down out of view (meters), then unmount.
	const slideMs = $derived(theme().animation.timing500);
	const drop = $derived(placement === 'camera' ? 0.5 : 0.3);
	let shown = $state(untrack(() => open));
	$effect(() => {
		if (open) return void (shown = true);
		if (!untrack(() => shown)) return;
		const timer = setTimeout(() => (shown = false), slideMs);
		return () => clearTimeout(timer);
	});
	const slideAttr = $derived(
		`property: position; to: 0 ${open ? 0 : -drop} 0; dur: ${slideMs}; easing: ${open ? 'easeOutCubic' : 'easeInCubic'}`
	);
</script>

<a-entity bind:this={anchor} class="ui-surface-anchor">
	{#if is3d}
		{#if shown}
			<!-- Recreated per placement, so each starts from a clean transform. -->
			{#key placement}
				{#if placement === 'world'}
					<a-entity {...rest}>{@render content3d()}</a-entity>
				{:else if placement === 'follow'}
					<a-entity ui-follow={followAttr}>{@render content3d()}</a-entity>
				{:else if placement === 'camera'}
					<a-entity ui-attach="target: {camera}; position: {offset}; rotation: 0 0 0">{@render content3d()}</a-entity>
				{:else}
					<a-entity ui-attach="target: {hand}; position: {handPosition}; rotation: {handRotation}">
						{@render content3d()}
					</a-entity>
				{/if}
			{/key}
		{/if}
	{:else if open}
		<div class="ui-surface" use:portal={{ screen, target }} transition:fly={{ y: 24, duration: slideMs }}>
			<DimensionScope dimension="2d"><StackScope>{@render children()}</StackScope></DimensionScope>
		</div>
	{/if}
</a-entity>

{#snippet content3d()}
	<!-- Starts below and slides up; `open` sends it back down. -->
	<a-entity position="0 {-drop} 0" animation__slide={slideAttr}>
		<a-entity scale="{size} {size} {depth}">
			<DimensionScope dimension="3d"><StackScope>{@render children()}</StackScope></DimensionScope>
		</a-entity>
	</a-entity>
{/snippet}

<style>
	:global(.ui-surface-region) {
		position: fixed;
		z-index: 900;
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 16px;
		pointer-events: none;
		max-width: calc(100vw - 32px);
		max-height: calc(100vh - 32px);
		box-sizing: border-box;
	}
	:global(.ui-surface-region > *) {
		pointer-events: auto;
	}
	:global(.ui-surface-region[data-screen^='top']) {
		top: 0;
	}
	:global(.ui-surface-region[data-screen^='bottom']) {
		bottom: 0;
		flex-direction: column-reverse;
	}
	:global(.ui-surface-region[data-screen$='left']) {
		left: 0;
		align-items: flex-start;
	}
	:global(.ui-surface-region[data-screen$='right']) {
		right: 0;
		align-items: flex-end;
	}
	:global(.ui-surface-region[data-screen='top']),
	:global(.ui-surface-region[data-screen='bottom']),
	:global(.ui-surface-region[data-screen='center']) {
		left: 50%;
		transform: translateX(-50%);
		align-items: center;
	}
	:global(.ui-surface-region[data-screen='left']),
	:global(.ui-surface-region[data-screen='right']),
	:global(.ui-surface-region[data-screen='center']) {
		top: 50%;
		transform: translateY(-50%);
	}
	:global(.ui-surface-region[data-screen='center']) {
		transform: translate(-50%, -50%);
	}
	.ui-surface {
		display: flex;
		flex-direction: column;
		align-items: inherit;
		gap: inherit;
	}
</style>

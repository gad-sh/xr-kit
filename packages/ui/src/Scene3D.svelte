<script lang="ts">
	// The <a-scene> for the design system: everything inside renders as A-Frame entities
	// (like <Space3D>), the mouse cursor and the lasers (laser-controls, keeping their own
	// raycaster's far) click `.raycastable`, the mouse cursor is removed in VR, xr.presenting
	// follows the headset, and troika-text is loaded first if the page didn't load it.
	// Other attributes and handlers go on the <a-scene>:
	//   <Scene3D embedded onenter-vr={…}> … </Scene3D>
	import type { Snippet } from 'svelte';
	import { setDimension } from './context';
	import { xr } from './xr.svelte';
	import { MOUSE_CURSOR, RAYCASTABLE, loadTroika, setupScene } from './aframe/scene';

	let {
		children,
		cursor = MOUSE_CURSOR,
		raycaster = `objects: .${RAYCASTABLE}`,
		mouseCursorInVR = false,
		...rest
	}: {
		children?: Snippet;
		// The scene's mouse cursor and its raycaster.
		cursor?: string;
		raycaster?: string;
		// Keep the mouse cursor in an immersive session (e.g. a demo that also simulates VR).
		mouseCursorInVR?: boolean;
		[attribute: string]: unknown;
	} = $props();

	setDimension('3d');

	const troika = loadTroika();
	let ready = $state(!troika);
	troika?.then(() => (ready = true));

	let scene = $state<HTMLElement>();
	$effect(() => {
		if (!scene) return;
		xr.watch(scene);
		return setupScene(scene, { cursor, mouseCursorInVR });
	});
</script>

{#if ready}
	<a-scene bind:this={scene} {cursor} {raycaster} {...rest}>
		{@render children?.()}
	</a-scene>
{/if}

<script lang="ts">
	// The VR section. A-Frame (with three.js, over 1 MB) is imported here, so the 2D routes
	// never download it; the library reads the AFRAME global it defines, so the scene renders
	// once it has loaded. Routes under vr/ share this one <Scene3D>: going between them swaps
	// their Surfaces without rebuilding the scene, and a VR session carries on. Leaving vr/
	// removes the scene, which ends the session.
	import { Scene3D } from '@gadxr/ui';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const aframe = import('aframe');
</script>

{#await aframe}
	<p class="loading">Loading the scene…</p>
{:then}
	<Scene3D>
		<a-sky color="#0b0e18"></a-sky>
		<a-entity light="type: ambient; intensity: 0.7"></a-entity>
		<a-entity light="type: directional; intensity: 1.5" position="2 4 3"></a-entity>
		<a-plane width="20" height="20" rotation="-90 0 0" color="#1d2335"></a-plane>
		<a-entity id="rig">
			<a-entity id="camera" camera look-controls wasd-controls position="0 1.6 0"></a-entity>
			<!-- The lasers click the UI in VR (the trigger). -->
			<a-entity laser-controls="hand: left"></a-entity>
			<a-entity laser-controls="hand: right"></a-entity>
		</a-entity>
		{@render children()}
	</Scene3D>
{/await}

<style>
	.loading {
		padding-top: 48px;
	}
</style>

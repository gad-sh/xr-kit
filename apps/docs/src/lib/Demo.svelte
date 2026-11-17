<script lang="ts">
	// A live demo: the component as HTML, and (when `camera` is set) the same markup in 3D,
	// rendered in an embedded <Scene3D> with the camera `camera` meters in front of it.
	// A-Frame is only loaded once someone opens a 3D preview.
	import { Scene3D } from '@xr-kit/ui';
	import { demos } from './demos';
	import { preview } from './preview.svelte';

	let { name, camera, code }: { name: string; camera: number | null; code: string } = $props();

	const id = $props.id();
	const Component = $derived(demos[name]);
	const in3d = $derived(preview.active === id);
	let aframe: Promise<unknown> | undefined = $state();
	// Demos mount in the browser only: not every component renders on the server
	// (RadialMenu reads the window size), and the page's Markdown has the code anyway.
	let mounted = $state(false);
	$effect(() => {
		mounted = true;
	});

	function show(dimension: '2d' | '3d') {
		if (dimension === '3d') aframe ??= import('aframe');
		preview.active = dimension === '3d' ? id : preview.active === id ? null : preview.active;
	}
</script>

<figure class="demo">
	{#if camera !== null}
		<div class="switch" role="group" aria-label="Render as">
			<button type="button" aria-pressed={!in3d} onclick={() => show('2d')}>HTML</button>
			<button type="button" aria-pressed={in3d} onclick={() => show('3d')}>3D</button>
		</div>
	{/if}
	<div class="stage" class:is3d={in3d}>
		{#if in3d}
			{#await aframe}
				<p class="loading">Loading A-Frame…</p>
			{:then}
				<Scene3D embedded vr-mode-ui="enabled: false">
					<a-sky color="#101018"></a-sky>
					<a-entity light="type: ambient; intensity: 0.7"></a-entity>
					<a-entity light="type: directional; intensity: 1.8" position="1 2 2"></a-entity>
					<a-entity camera="fov: 50" look-controls="enabled: false" position="0 0 {camera}"></a-entity>
					<Component />
				</Scene3D>
			{/await}
		{:else if mounted}
			<Component />
		{/if}
	</div>
	<div class="code">{@html code}</div>
</figure>

<style>
	.demo {
		position: relative;
		margin: 24px 0;
		border: 1px solid var(--border);
		border-radius: 12px;
		overflow: hidden;
	}
	.stage {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		/* A row wider than a phone scrolls instead of being cut off at both ends. */
		justify-content: safe center;
		overflow-x: auto;
		gap: 16px;
		min-height: 120px;
		padding: 40px 24px;
		background:
			radial-gradient(circle at 20% 30%, #276ef122, transparent 40%),
			radial-gradient(circle at 80% 70%, #e1190018, transparent 40%),
			#000;
	}
	.stage.is3d {
		padding: 0;
		height: 380px;
	}
	.stage.is3d :global(a-scene) {
		width: 100%;
		height: 100%;
	}
	.loading {
		color: var(--text-2);
	}
	.switch {
		position: absolute;
		top: 8px;
		right: 8px;
		z-index: 1;
		display: flex;
		border: 1px solid var(--border);
		border-radius: 8px;
		overflow: hidden;
	}
	.switch button {
		font: inherit;
		font-size: 13px;
		padding: 4px 10px;
		border: 0;
		background: var(--bg-2);
		color: var(--text-2);
		cursor: pointer;
	}
	.switch button[aria-pressed='true'] {
		background: var(--accent);
		color: #fff;
	}
	.code :global(pre) {
		margin: 0;
		border: 0;
		border-top: 1px solid var(--border);
		border-radius: 0;
	}
</style>

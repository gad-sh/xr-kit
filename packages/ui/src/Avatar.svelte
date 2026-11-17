<script lang="ts">
	// Base UI-style Avatar: a player's picture (`src`), or their initials on a color picked
	// from their name. Optional `status` dot. 3D: a thin disc with the picture or initials
	// on its face.
	import { ensure3d } from './aframe';
	import { avatarColor, initials } from './component-style';
	import { getDimension, getTheme } from './context';
	import { font3d } from './fonts';
	import { useSlot } from './layout.svelte';
	import type { AvatarSize, AvatarStatus, Dimension } from './theme';

	type Props = {
		name?: string;
		src?: string;
		size?: AvatarSize;
		status?: AvatarStatus;
		// Overrides the color picked from the name.
		color?: string;
		dimension?: Dimension;
		[attribute: string]: unknown;
	};

	let { name = '', src, size = 'medium', status, color, dimension, style: userStyle = '', ...rest }: Props = $props();

	const theme = getTheme();
	const t = $derived(theme());
	const tk = $derived(t.avatar);
	const c = $derived(t.colors.avatar);
	const px = $derived(tk.sizes[size]);
	const fill = $derived(color ?? avatarColor(name, c.palette));
	const letters = $derived(initials(name));
	const dot = $derived(Math.max(8, Math.round(px * tk.status)));
	const label = $derived([name, status].filter(Boolean).join(', ') || 'Avatar');
	const contextDimension = getDimension();
	// svelte-ignore state_referenced_locally
	const is3d = (dimension ?? contextDimension) === '3d';

	// The picture, once it has loaded; initials until then, and if it fails.
	let image: HTMLImageElement | null = $state(null);
	const imageOk = $derived(!!image);
	$effect(() => {
		image = null;
		if (!src) return;
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => (image = img);
		img.src = src;
		return () => {
			img.onload = null;
		};
	});

	// ---- 3D ----
	const m = (v: number) => v * t.space3d.metersPerPx;
	if (is3d) ensure3d();
	const d = $derived(m(px));
	const slot = is3d ? useSlot(() => ({ width: d, height: d })) : () => ({ x: 0, y: 0 });
	const depth = $derived(Math.min(0.02, d * 0.12));
	const face = $derived(depth / 2 + 0.001);
	// Status dot on the rim at the bottom right (45°), cut out with a ring of the panel color.
	const dotAt = $derived((d / 2) * Math.SQRT1_2);
	const dotR = $derived(m(dot) / 2);
	// The loaded <img> goes to the material as an object: a URL in the attribute string
	// would be split at the `;` in data: URLs.
	let faceEl: (HTMLElement & { setAttribute(name: string, value: unknown): void }) | undefined = $state();
	$effect(() => {
		if (faceEl && image) faceEl.setAttribute('material', { shader: 'flat', src: image });
	});
</script>

{#if is3d}
	<a-entity {...rest}>
		<a-entity position="{slot().x} {slot().y} 0">
			<a-entity
				geometry="primitive: cylinder; radius: {d / 2}; height: {depth}; segmentsRadial: 48"
				material="color: {fill}; roughness: 0.6"
				rotation="90 0 0"
			></a-entity>
			{#if src && imageOk}
				<a-entity bind:this={faceEl} geometry="primitive: circle; radius: {d / 2}; segments: 48" position="0 0 {face}"></a-entity>
			{:else if letters}
				<a-entity
					troika-text="value: {letters.replace(/;/g, ',')}; fontSize: {d * tk.initials}; color: {c.text}; font: {font3d(t)}; anchor: center; baseline: center"
					troika-text-material="shader: standard"
					position="0 0 {face}"
				></a-entity>
			{/if}
			{#if status}
				<a-entity position="{dotAt} {-dotAt} {face + 0.002}">
					<a-entity geometry="primitive: circle; radius: {dotR + m(tk.statusRing)}; segments: 32" material="color: {c.statusRing}; shader: flat"></a-entity>
					<a-entity geometry="primitive: circle; radius: {dotR}; segments: 32" material="color: {c.status[status]}; shader: flat" position="0 0 0.001"></a-entity>
				</a-entity>
			{/if}
		</a-entity>
	</a-entity>
{:else}
	<span
		class="ui-avatar"
		role="img"
		aria-label={label}
		style="--ui-size: {px}px; --ui-fill: {fill}; --ui-text: {c.text}; --ui-font: 600 {Math.round(px * tk.initials)}px/1 {t.typography.fontFamily}; --ui-dot: {dot}px; --ui-ring: {tk.statusRing}px; --ui-ring-color: {c.statusRing}; {userStyle}"
		{...rest}
	>
		{#if src && imageOk}
			<img {src} alt="" />
		{:else}
			<span aria-hidden="true">{letters}</span>
		{/if}
		{#if status}<span class="status" style="background: {c.status[status]};"></span>{/if}
	</span>
{/if}

<style>
	.ui-avatar {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: none;
		width: var(--ui-size);
		height: var(--ui-size);
		border-radius: 50%;
		background: var(--ui-fill);
		color: var(--ui-text);
		font: var(--ui-font);
		user-select: none;
	}
	img {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		object-fit: cover;
	}
	.status {
		position: absolute;
		/* Centered on the rim at the bottom right (45°). */
		right: calc(var(--ui-size) * 0.1464 - var(--ui-dot) / 2);
		bottom: calc(var(--ui-size) * 0.1464 - var(--ui-dot) / 2);
		width: var(--ui-dot);
		height: var(--ui-dot);
		border-radius: 50%;
		box-shadow: 0 0 0 var(--ui-ring) var(--ui-ring-color);
	}
</style>

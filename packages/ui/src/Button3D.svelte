<script lang="ts">
	// A-Frame rendering of Button: a `rounded` slab plus a troika label, centered on
	// the entity's position and sized to fit the label. Clicked through the A-Frame
	// cursor: the slab carries `.raycastable` (the raycaster only tests meshes set
	// directly on matching entities), and its events bubble up to the root.
	import { ensure3d } from './aframe';
	import { watchTextSize } from './aframe/measure';
	import { resolveButtonStyle } from './button-style';
	import { getTheme } from './context';
	import { font3d } from './fonts';
	import { useSlot } from './layout.svelte';
	import type { ButtonProps } from './types';

	let {
		label = '',
		children: _children,
		kind,
		size,
		shape,
		isSelected,
		disabled = false,
		inert = false,
		onclick,
		class: className = '',
		...rest
	}: ButtonProps = $props();

	// Registers `rounded` before the entities below are created.
	ensure3d();

	const theme = getTheme();
	const t = $derived(theme());
	const s = $derived(resolveButtonStyle(t, { kind, size, shape, selected: isSelected, disabled }));
	const m = (px: number) => px * t.space3d.metersPerPx;

	let hovered = $state(false);
	let pressed = $state(false);
	let textWidth = $state(0);
	let labelEl: HTMLElement | undefined = $state();

	const interactive = $derived(!disabled && !inert);
	const height = $derived(m(s.height));
	const width = $derived(s.square ? height : Math.max(height, textWidth + 2 * m(s.paddingX)));
	const depth = $derived(t.space3d.depth);

	// Position within a ButtonGroup / Panel, if in one.
	const slot = useSlot(() => ({ width, height }));

	// Losing interactivity mid-hover never gets a mouseleave, so reset here.
	$effect(() => {
		if (!interactive) hovered = pressed = false;
	});

	const slab = $derived.by(() => {
		const glass = s.material === 'glass';
		// Tertiary has no slab until hovered.
		const hidden = s.material === 'none' && !hovered && !pressed;
		const fill = pressed ? s.activeFill : hovered || hidden ? s.hoverFill : s.fill;
		return [
			`width: ${width}`,
			`height: ${height}`,
			`depth: ${depth}`,
			`radius: ${m(s.radius)}`,
			`glass: ${glass}`,
			`color: ${glass ? '#FFFFFF' : fill}`,
			`opacity: ${s.material === 'none' ? 0.8 : 1}`,
			`enabled: ${!hidden}`,
		].join('; ');
	});

	const text = $derived(
		[
			`value: ${label.replace(/;/g, ',')}`,
			`fontSize: ${m(s.font.fontSize) * t.space3d.textScale}`,
			`color: ${s.text3d}`,
			`font: ${font3d(t)}`,
			'anchor: center',
			'baseline: center',
		].join('; ')
	);

	const scale = $derived(hovered && interactive ? t.space3d.hoverScale : 1);
	const motion = $derived(`dur: ${t.animation.timing100}; easing: ${t.animation.easeOut3d}`);

	// Measure the label once troika has laid it out, to size the slab.
	$effect(() => {
		if (labelEl) return watchTextSize(labelEl, (w) => (textWidth = w));
	});
</script>

<!-- 3D button clicked via the A-Frame cursor, not a DOM control -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions, a11y_mouse_events_have_key_events -->
<a-entity
	{...rest}
	class={className}
	onclick={(event: Event) => interactive && onclick?.(event)}
	onmouseenter={() => interactive && (hovered = true)}
	onmouseleave={() => (hovered = pressed = false)}
	onmousedown={() => interactive && (pressed = true)}
	onmouseup={() => (pressed = false)}
>
	<a-entity position="{slot().x} {slot().y} 0">
		<a-entity
			animation__uiscale="property: scale; to: {scale} {scale} 1; {motion}"
			animation__uipress="property: object3D.position.z; to: {pressed ? -t.space3d.pressDepth : 0}; {motion}"
		>
			<a-entity class={interactive ? 'raycastable' : ''} rounded={slab} position="{-width / 2} {-height / 2} 0"></a-entity>
			<a-entity
				bind:this={labelEl}
				troika-text={text}
				troika-text-material="shader: standard"
				position="0 0 {depth + 0.002}"
			></a-entity>
		</a-entity>
	</a-entity>
</a-entity>

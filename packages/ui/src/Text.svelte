<script lang="ts">
	// Typography. 2D: a <span>. 3D: troika text, anchored by `align` (default center).
	// Inside a Panel / ButtonGroup it measures itself and takes its place in the stack.
	import { ensure3d } from './aframe';
	import { setTroikaValue, watchTextSize } from './aframe/measure';
	import { getDimension, getTheme } from './context';
	import { font3d } from './fonts';
	import { inStack, useSlot } from './layout.svelte';
	import type { TextProps } from './types';

	let {
		text = '',
		children,
		variant = 'ParagraphMedium',
		color,
		align,
		maxWidth,
		dimension,
		style: userStyle = '',
		...rest
	}: TextProps = $props();

	const contextDimension = getDimension();
	const theme = getTheme();
	const t = $derived(theme());
	const font = $derived(t.typography[variant]);
	const textColor = $derived(color ?? t.colors.contentPrimary);
	const is3d = $derived((dimension ?? contextDimension) === '3d');
	const anchor = $derived(align ?? 'center');

	// 3D only.
	let size = $state({ width: 0, height: 0 });
	let textEl: HTMLElement | undefined = $state();
	// svelte-ignore state_referenced_locally
	const stacked = (dimension ?? contextDimension) === '3d' && inStack();
	const slot = stacked ? useSlot(() => size) : () => ({ x: 0, y: 0 });
	// In a stack the slot is the text's center, so shift left/right-anchored text to fill it.
	// Outside one, the anchor is relative to the entity's own position.
	const anchorShift = $derived(
		!stacked ? 0 : anchor === 'left' ? -size.width / 2 : anchor === 'right' ? size.width / 2 : 0
	);

	$effect(() => {
		if (is3d) ensure3d();
	});
	$effect(() => {
		if (textEl) return watchTextSize(textEl, (width, height) => (size = { width, height }));
	});
	// Set apart from the attribute string, which A-Frame splits on `;` (chat text can have one).
	$effect(() => setTroikaValue(textEl, text));

	const troika = $derived.by(() => {
		const m = t.space3d.metersPerPx;
		return [
			`fontSize: ${font.fontSize * m * t.space3d.textScale}`,
			`lineHeight: ${font.lineHeight / font.fontSize}`,
			`color: ${textColor}`,
			`font: ${font3d(t)}`,
			`align: ${anchor}`,
			`anchor: ${anchor}`,
			maxWidth ? `maxWidth: ${maxWidth * m}` : '',
		]
			.filter(Boolean)
			.join('; ');
	});
</script>

{#if is3d}
	<a-entity {...rest}>
		<a-entity
			bind:this={textEl}
			troika-text={troika}
			troika-text-material="shader: standard"
			position="{slot().x + anchorShift} {slot().y} 0"
		></a-entity>
	</a-entity>
{:else}
	<span
		class="ui-text"
		style="font: {font.fontWeight} {font.fontSize}px/{font.lineHeight}px {t.typography.fontFamily}; color: {textColor}; text-align: {align ?? 'inherit'}; {maxWidth
			? `max-width: ${maxWidth}px; display: inline-block;`
			: ''} {userStyle}"
		{...rest}
	>
		{#if children}{@render children()}{:else}{text}{/if}
	</span>
{/if}

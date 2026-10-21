<script lang="ts">
	// Base UI-style button. Renders HTML, or A-Frame entities inside <Space3D>
	// (or with dimension="3d"). Inside a ButtonGroup, unset kind/size/shape/disabled
	// come from the group, and clicks drive the group's selection.
	import Button2D from './Button2D.svelte';
	import Button3D from './Button3D.svelte';
	import { getButtonGroup, getDimension } from './context';
	import type { ButtonProps } from './types';

	let { dimension, kind, size, shape, disabled, isSelected, onclick, ...rest }: ButtonProps = $props();

	const contextDimension = getDimension();
	const group = getButtonGroup();
	const index = group?.register() ?? -1;

	const resolved = $derived({
		kind: kind ?? group?.kind,
		size: size ?? group?.size,
		shape: shape ?? group?.shape,
		disabled: disabled ?? group?.disabled ?? false,
		isSelected: isSelected ?? group?.isSelected(index),
	});

	function handleClick(event: Event) {
		if (resolved.disabled) return;
		group?.select(index);
		onclick?.(event);
	}
</script>

{#if (dimension ?? contextDimension) === '3d'}
	<Button3D {...rest} {...resolved} onclick={handleClick} />
{:else}
	<Button2D {...rest} {...resolved} onclick={handleClick} />
{/if}

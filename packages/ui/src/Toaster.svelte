<script lang="ts">
	// Shows the toast queue (toast.svelte.ts). 2D: fixed in a corner of the page.
	// 3D: a column whose `placement` corner sits at this entity's position (bottom-right:
	// grows up and to the left from it) — e.g. under the camera, low and to the side.
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import Button from './Button.svelte';
	import { getDimension, getTheme } from './context';
	import { createStack, setStack, useSlot } from './layout.svelte';
	import Panel from './Panel.svelte';
	import Text from './Text.svelte';
	import { toaster, type Toast } from './toast.svelte';
	import type { Dimension } from './theme';

	type Placement = 'top-left' | 'top' | 'top-right' | 'bottom-left' | 'bottom' | 'bottom-right';
	type Props = {
		placement?: Placement;
		// Most toasts shown at once (the newest).
		max?: number;
		dimension?: Dimension;
		[attribute: string]: unknown;
	};

	let { placement = 'bottom-right', max = 4, dimension, ...rest }: Props = $props();

	const theme = getTheme();
	const t = $derived(theme());
	const tk = $derived(t.toast);
	const visible = $derived(toaster.items.slice(-max));
	const contextDimension = getDimension();
	// svelte-ignore state_referenced_locally
	const is3d = (dimension ?? contextDimension) === '3d';

	const m = (px: number) => px * t.space3d.metersPerPx;
	const column = is3d
		? createStack(() => ({ direction: 'column', gap: m(8), align: placement.endsWith('left') ? 'start' : placement.endsWith('right') ? 'end' : 'center' }))
		: undefined;
	const slot = is3d ? useSlot(() => column!.size) : () => ({ x: 0, y: 0 });
	setStack(column);
	// Shift the column so its `placement` corner/edge is at the origin.
	const anchor = $derived({
		x: placement.endsWith('right') ? -(column?.size.width ?? 0) / 2 : placement.endsWith('left') ? (column?.size.width ?? 0) / 2 : 0,
		y: placement.startsWith('bottom') ? (column?.size.height ?? 0) / 2 : -(column?.size.height ?? 0) / 2,
	});
</script>

{#snippet toastPanel(toast: Toast)}
	{@const colors = t.colors.toast[toast.kind]}
	<Panel
		fill={colors.fill}
		width={tk.width}
		padding={tk.padding}
		style="border-left: 4px solid {colors.accent};"
		role={toast.kind === 'negative' ? 'alert' : 'status'}
	>
		{#snippet action()}
			<Button label="×" kind="tertiary" shape="circle" size="mini" aria-label="Dismiss" onclick={() => toaster.dismiss(toast.id)} />
		{/snippet}
		<Text variant="LabelMedium" align="left" color={colors.text} maxWidth={tk.width - 2 * tk.padding - 32} text={toast.message} />
	</Panel>
{/snippet}

{#if is3d}
	<a-entity {...rest}>
		<a-entity position="{slot().x + anchor.x} {slot().y + anchor.y} 0">
			{#each visible as toast (toast.id)}
				<!-- Slides forward into place when it appears. -->
				<a-entity animation__in="property: position; from: 0 0 -0.08; to: 0 0 0; dur: {t.animation.timing300}; easing: {t.animation.easeOut3d}">
					{@render toastPanel(toast)}
				</a-entity>
			{/each}
		</a-entity>
	</a-entity>
{:else}
	<div class="ui-toaster" data-placement={placement} aria-live="polite" {...rest}>
		{#each visible as toast (toast.id)}
			<div animate:flip={{ duration: 200 }} transition:fly={{ y: placement.startsWith('top') ? -16 : 16, duration: 200 }}>
				{@render toastPanel(toast)}
			</div>
		{/each}
	</div>
{/if}

<style>
	.ui-toaster {
		position: fixed;
		z-index: 1000;
		display: flex;
		flex-direction: column;
		gap: 8px;
		pointer-events: none;
	}
	.ui-toaster > :global(*) {
		pointer-events: auto;
	}
	[data-placement^='top'] {
		top: 16px;
	}
	[data-placement^='bottom'] {
		bottom: 16px;
	}
	[data-placement$='left'] {
		left: 16px;
	}
	[data-placement$='right'] {
		right: 16px;
	}
	[data-placement='top'],
	[data-placement='bottom'] {
		left: 50%;
		transform: translateX(-50%);
	}
</style>

<script lang="ts">
	// Base UI-style Modal: a titled dialog with body content and footer actions.
	//   <Modal bind:open title="Leave world?">…body…{#snippet actions()}<Button …/>{/snippet}</Modal>
	// 2D: a native <dialog> (focus trap, Escape, backdrop). 3D: a Panel in front of a large
	// dimmed plane that blocks clicks to the world; place it where the player will see it
	// (e.g. under the camera). Escape / the × / clicking the dimmed area close it when `closeable`.
	import type { Snippet } from 'svelte';
	import Button from './Button.svelte';
	import { getDimension, getTheme } from './context';
	import Panel from './Panel.svelte';
	import Stack from './Stack.svelte';
	import StackScope from './StackScope.svelte';
	import type { Dimension } from './theme';

	type Props = {
		open?: boolean;
		title?: string;
		children?: Snippet;
		actions?: Snippet;
		closeable?: boolean;
		onclose?: () => void;
		// px
		width?: number;
		dimension?: Dimension;
		[attribute: string]: unknown;
	};

	const theme = getTheme();
	let {
		open = $bindable(false),
		title,
		children,
		actions,
		closeable = true,
		onclose,
		width = theme().modal.width,
		dimension,
		...rest
	}: Props = $props();

	const t = $derived(theme());
	const contextDimension = getDimension();
	const is3d = $derived((dimension ?? contextDimension) === '3d');

	function close() {
		if (!open) return;
		open = false;
		onclose?.();
	}

	// 2D: keep the native dialog in sync with `open`.
	let dialog: HTMLDialogElement | undefined = $state();
	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	});

	// 3D: Escape closes (desktop).
	$effect(() => {
		if (!is3d || !open || !closeable) return;
		const onkey = (event: KeyboardEvent) => event.key === 'Escape' && close();
		window.addEventListener('keydown', onkey);
		return () => window.removeEventListener('keydown', onkey);
	});
</script>

{#snippet closeButton()}
	<Button label="×" kind="tertiary" shape="circle" size="compact" aria-label="Close" onclick={close} />
{/snippet}

{#snippet content()}
	<Panel {title} {width} catchClicks action={closeable ? closeButton : undefined}>
		{@render children?.()}
		{#if actions}
			<Stack direction="row" gap={12} alignSelf="end">{@render actions()}</Stack>
		{/if}
	</Panel>
{/snippet}

{#if is3d}
	{#if open}
		<!-- An overlay: not part of any surrounding Panel / Stack layout. -->
		<StackScope>
			<a-entity {...rest}>
				<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
				<a-entity
					class="raycastable"
					geometry="primitive: plane; width: 12; height: 12"
					material="color: {t.colors.modal.backdrop}; opacity: {t.colors.modal.backdropOpacity}; transparent: true; shader: flat"
					position="0 0 -0.08"
					onclick={() => closeable && close()}
				></a-entity>
				<a-entity
					animation__open="property: scale; from: 0.92 0.92 0.92; to: 1 1 1; dur: {t.animation.timing200}; easing: {t.animation.easeOut3d}"
				>
					{@render content()}
				</a-entity>
			</a-entity>
		</StackScope>
	{/if}
{:else}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
	<dialog
		bind:this={dialog}
		class="ui-modal"
		style="--ui-backdrop: {t.colors.modal.backdrop}; --ui-backdrop-opacity: {t.colors.modal.backdropOpacity};"
		onclose={close}
		oncancel={(event) => !closeable && event.preventDefault()}
		onclick={(event) => event.target === dialog && closeable && close()}
		{...rest}
	>
		{@render content()}
	</dialog>
{/if}

<style>
	.ui-modal {
		padding: 0;
		border: 0;
		background: transparent;
		color: inherit;
		max-width: calc(100vw - 32px);
		overflow: visible;
	}
	.ui-modal[open] {
		animation: ui-modal-in 0.2s cubic-bezier(0.2, 0.8, 0.4, 1);
	}
	.ui-modal::backdrop {
		background: color-mix(in srgb, var(--ui-backdrop) calc(var(--ui-backdrop-opacity) * 100%), transparent);
		backdrop-filter: blur(4px);
	}
	@keyframes ui-modal-in {
		from {
			opacity: 0;
			transform: scale(0.96);
		}
	}
</style>

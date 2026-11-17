<script lang="ts">
	import { resolveButtonStyle } from './button-style';
	import { getTheme } from './context';
	import type { ButtonProps } from './types';

	let {
		label = '',
		children,
		kind,
		size,
		shape,
		isSelected,
		disabled = false,
		inert = false,
		onclick,
		class: className = '',
		style: userStyle = '',
		...rest
	}: ButtonProps = $props();

	const theme = getTheme();
	const t = $derived(theme());
	const s = $derived(resolveButtonStyle(t, { kind, size, shape, selected: isSelected, disabled }));
	const vars = $derived(
		[
			`--ui-height: ${s.height}px`,
			`--ui-padding-x: ${s.paddingX}px`,
			`--ui-radius: ${s.radius}px`,
			`--ui-fill: ${s.fill}`,
			`--ui-hover: ${s.hoverFill}`,
			`--ui-active: ${s.activeFill}`,
			`--ui-text: ${s.text}`,
			`--ui-focus: ${t.colors.accent}`,
			`--ui-font: ${s.font.fontWeight} ${s.font.fontSize}px/${s.font.lineHeight}px ${t.typography.fontFamily}`,
			`--ui-duration: ${t.animation.timing200}ms`,
			`--ui-easing: ${t.animation.easeOutCurve}`,
		].join('; ')
	);
</script>

<button
	type="button"
	class="ui-button {className}"
	class:square={s.square}
	style="{vars}; {userStyle}"
	aria-pressed={isSelected}
	{disabled}
	{inert}
	{onclick}
	{...rest}
>
	{#if children}{@render children()}{:else}{label}{/if}
</button>

<style>
	.ui-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		box-sizing: border-box;
		height: var(--ui-height);
		min-width: var(--ui-height);
		padding: 0 var(--ui-padding-x);
		border: 0;
		border-radius: var(--ui-radius);
		background: var(--ui-fill);
		color: var(--ui-text);
		font: var(--ui-font);
		white-space: nowrap;
		cursor: pointer;
		transition: background-color var(--ui-duration) var(--ui-easing);
	}
	.square {
		width: var(--ui-height);
	}
	.ui-button:hover:not(:disabled) {
		background: var(--ui-hover);
	}
	.ui-button:active:not(:disabled) {
		background: var(--ui-active);
	}
	.ui-button:focus-visible {
		outline: 3px solid var(--ui-focus);
		outline-offset: 2px;
	}
	.ui-button:disabled {
		cursor: not-allowed;
	}
</style>

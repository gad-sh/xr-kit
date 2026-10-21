<script lang="ts">
	// Base UI-style single-line text Input: a label, the field, and a caption (or an
	// error, which replaces it and turns the field red).
	// 2D: a native <input>. 3D: a field with a blinking caret; clicking focuses it and
	// places the caret. The physical keyboard types into a focused 3D field (desktop, or a
	// keyboard paired to the headset); in VR a <Keyboard> placed in the scene opens.
	// Enter submits (`onsubmit`; `blurOnSubmit={false}` keeps editing, e.g. chat, and
	// `onsubmit` returning false keeps editing that once, e.g. an invalid value);
	// Escape / the keyboard's close key restores the value from before editing (`oncancel`).
	import { untrack } from 'svelte';
	import { ensure3d } from './aframe';
	import { setTroikaValue } from './aframe/measure';
	import { resolveInputStyle } from './component-style';
	import { getDimension, getTheme } from './context';
	import { font3d } from './fonts';
	import type { EnterKeyHint } from './keyboard-layout';
	import { useSlot } from './layout.svelte';
	import { clampCaret, edit } from './text-edit';
	import { textFocus, type Editable } from './text-focus.svelte';
	import TextLine3D from './TextLine3D.svelte';
	import type { Dimension } from './theme';
	import { xr } from './xr.svelte';

	type Props = {
		value?: string;
		label?: string;
		placeholder?: string;
		caption?: string;
		// A message: shown instead of the caption, and the field turns red.
		error?: string;
		disabled?: boolean;
		// px
		width?: number;
		maxLength?: number;
		// 'numeric' opens the VR keyboard on its numbers page.
		inputmode?: 'text' | 'numeric';
		// The VR keyboard's enter key label (and the mobile one in 2D).
		enterkeyhint?: EnterKeyHint;
		// Stop editing after submit (default). False keeps the field and keyboard open (chat).
		blurOnSubmit?: boolean;
		focused?: boolean;
		// Return false to keep editing (e.g. the value is invalid).
		onsubmit?: (value: string) => boolean | void;
		oncancel?: () => void;
		dimension?: Dimension;
		[attribute: string]: unknown;
	};

	const theme = getTheme();
	let {
		value = $bindable(''),
		label = '',
		placeholder = '',
		caption = '',
		error = '',
		disabled = false,
		width = theme().input.width,
		maxLength,
		inputmode = 'text',
		enterkeyhint = 'enter',
		blurOnSubmit = true,
		focused = $bindable(false),
		onsubmit,
		oncancel,
		dimension,
		style: userStyle = '',
		...rest
	}: Props = $props();

	const t = $derived(theme());
	const contextDimension = getDimension();
	// svelte-ignore state_referenced_locally
	const is3d = (dimension ?? contextDimension) === '3d';

	// The value when editing started, for cancel.
	let original = '';
	let hovered = $state(false);
	const message = $derived(error || caption);

	// ---- 3D ----
	const m = (px: number) => px * t.space3d.metersPerPx;
	if (is3d) ensure3d();
	let rootEl: HTMLElement | undefined = $state();
	let caret = $state(0);
	// The value can change from outside while editing (e.g. cleared after a chat send).
	const caretPos = $derived(clampCaret(value, caret));

	const editable: Editable = {
		get text() {
			return value;
		},
		get caret() {
			return caretPos;
		},
		get placeholder() {
			return placeholder;
		},
		get inputmode() {
			return inputmode;
		},
		get enterKeyHint() {
			return enterkeyhint;
		},
		get el() {
			return rootEl;
		},
		edit(action) {
			const result = edit({ text: value, caret: caretPos }, action, { maxLength });
			if (!result) return;
			value = result.state.text;
			caret = result.state.caret;
		},
		setCaret(index) {
			caret = clampCaret(value, index);
		},
		enter() {
			if (onsubmit?.(value) !== false && blurOnSubmit) stop();
		},
		done: () => stop(),
		cancel() {
			value = original;
			caret = value.length;
			oncancel?.();
			stop();
		},
	};

	const hasFocus = $derived(is3d ? textFocus.current === editable : focused);
	const s = $derived(resolveInputStyle(t, { focused: hasFocus, hovered, error: !!error, disabled }));

	let warned = false;
	function start() {
		if (disabled || textFocus.current === editable) return;
		original = value;
		caret = value.length;
		textFocus.focus(editable);
		if (xr.immersive && !textFocus.keyboards.size && !warned) {
			warned = true;
			console.warn('gadxr ui: a 3D Input has focus in VR, but no <Keyboard /> is in the scene to type with.');
		}
	}
	function stop() {
		textFocus.blur(editable);
	}

	if (is3d) {
		// `focused` from outside → focus / blur; focus changing here → `focused`.
		$effect(() => {
			if (focused !== untrack(() => hasFocus)) untrack(() => (focused ? start() : stop()));
		});
		$effect(() => {
			const f = hasFocus;
			untrack(() => {
				if (focused !== f) focused = f;
			});
		});
		$effect(() => {
			if (disabled) untrack(stop);
		});
		$effect(() => () => stop());
	}

	const W = $derived(m(width));
	const textScale = $derived(t.space3d.textScale);
	const labelH = $derived(label ? m(s.labelFont.lineHeight) * textScale : 0);
	const fieldH = $derived(m(s.height));
	const messageH = $derived(message ? m(s.captionFont.lineHeight) * textScale : 0);
	const gap = $derived(m(t.input.gap));
	const size = $derived({
		width: W,
		height: labelH + (label ? gap : 0) + fieldH + (message ? gap : 0) + messageH,
	});
	const slot = is3d ? useSlot(() => size) : () => ({ x: 0, y: 0 });
	const labelY = $derived(size.height / 2 - labelH / 2);
	const fieldY = $derived(size.height / 2 - labelH - (label ? gap : 0) - fieldH / 2);
	const messageY = $derived(-size.height / 2 + messageH / 2);
	const depth = 0.02;
	const border = $derived(m(s.border));
	const padX = $derived(m(s.paddingX));

	let labelEl: HTMLElement | undefined = $state();
	let messageEl: HTMLElement | undefined = $state();
	$effect(() => setTroikaValue(labelEl, label));
	$effect(() => setTroikaValue(messageEl, message));

	function pick(index: number) {
		start();
		editable.setCaret(index);
	}

	// ---- 2D ----
	let inputEl: HTMLInputElement | undefined = $state();
	$effect(() => {
		if (is3d || !inputEl) return;
		if (focused && document.activeElement !== inputEl) inputEl.focus();
		else if (!focused && document.activeElement === inputEl) inputEl.blur();
	});

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			if (onsubmit?.(value) !== false && blurOnSubmit) inputEl?.blur();
		} else if (event.key === 'Escape') {
			event.preventDefault();
			value = original;
			oncancel?.();
			inputEl?.blur();
		}
	}
</script>

{#if is3d}
	<!-- svelte-ignore a11y_no_static_element_interactions, a11y_mouse_events_have_key_events -->
	<a-entity
		{...rest}
		bind:this={rootEl}
		onmouseenter={() => (hovered = !disabled)}
		onmouseleave={() => (hovered = false)}
	>
		<a-entity position="{slot().x} {slot().y} 0">
			{#if label}
				<a-entity
					bind:this={labelEl}
					troika-text="fontSize: {m(s.labelFont.fontSize) * textScale}; color: {s.labelColor}; font: {font3d(t)}; anchor: left; baseline: center"
					troika-text-material="shader: standard"
					position="{-W / 2} {labelY} 0.002"
				></a-entity>
			{/if}
			<a-entity position="0 {fieldY} 0">
				<!-- Border: a slab behind the field, showing around its edge. -->
				<a-entity
					rounded="width: {W}; height: {fieldH}; depth: {depth}; radius: {m(s.radius)}; color: {s.borderColor}"
					position="{-W / 2} {-fieldH / 2} 0"
				></a-entity>
				<a-entity
					rounded="width: {W - 2 * border}; height: {fieldH - 2 * border}; depth: {depth}; radius: {Math.max(m(s.radius) - border, 0)}; color: {s.fill}"
					position="{-W / 2 + border} {-fieldH / 2 + border} 0.002"
				></a-entity>
				<a-entity position="0 0 {depth + 0.003}">
					<TextLine3D
						text={value}
						caret={caretPos}
						focused={hasFocus}
						{placeholder}
						font={s.font}
						color={s.text}
						placeholderColor={s.placeholder}
						caretColor={s.caret}
						width={W - 2 * padX}
						hitWidth={W}
						hitHeight={fieldH}
						interactive={!disabled}
						onpick={pick}
					/>
				</a-entity>
			</a-entity>
			{#if message}
				<a-entity
					bind:this={messageEl}
					troika-text="fontSize: {m(s.captionFont.fontSize) * textScale}; color: {s.captionColor}; font: {font3d(t)}; anchor: left; baseline: center"
					troika-text-material="shader: standard"
					position="{-W / 2} {messageY} 0.002"
				></a-entity>
			{/if}
		</a-entity>
	</a-entity>
{:else}
	<label
		class="ui-input"
		class:disabled
		class:invalid={!!error}
		style="--ui-width: {width}px; --ui-height: {s.height}px; --ui-padding-x: {s.paddingX}px; --ui-radius: {s.radius}px; --ui-border-width: {s.border}px; --ui-fill: {s.fill}; --ui-border: {s.borderColor}; --ui-hover: {t.colors.input.hover}; --ui-focus: {error ? t.colors.input.error : t.colors.input.focus}; --ui-text: {s.text}; --ui-placeholder: {s.placeholder}; --ui-caret: {s.caret}; --ui-label: {s.labelColor}; --ui-caption: {s.captionColor}; --ui-gap: {t.input.gap}px; --ui-font: {s.font.fontWeight} {s.font.fontSize}px/{s.font.lineHeight}px {t.typography.fontFamily}; --ui-label-font: {s.labelFont.fontWeight} {s.labelFont.fontSize}px/{s.labelFont.lineHeight}px {t.typography.fontFamily}; --ui-caption-font: {s.captionFont.fontWeight} {s.captionFont.fontSize}px/{s.captionFont.lineHeight}px {t.typography.fontFamily}; --ui-duration: {t.animation.timing200}ms; {userStyle}"
		{...rest}
	>
		{#if label}<span class="label">{label}</span>{/if}
		<input
			bind:this={inputEl}
			bind:value
			type="text"
			{placeholder}
			{disabled}
			{inputmode}
			{enterkeyhint}
			maxlength={maxLength}
			aria-invalid={!!error}
			onfocus={() => {
				original = value;
				focused = true;
			}}
			onblur={() => (focused = false)}
			{onkeydown}
		/>
		{#if message}<span class="message" role={error ? 'alert' : undefined}>{message}</span>{/if}
	</label>
{/if}

<style>
	.ui-input {
		display: inline-flex;
		flex-direction: column;
		gap: var(--ui-gap);
		width: var(--ui-width);
		max-width: 100%;
		text-align: start;
	}
	.label {
		font: var(--ui-label-font);
		color: var(--ui-label);
	}
	input {
		box-sizing: border-box;
		width: 100%;
		height: var(--ui-height);
		padding: 0 var(--ui-padding-x);
		border: var(--ui-border-width) solid var(--ui-border);
		border-radius: var(--ui-radius);
		background: var(--ui-fill);
		color: var(--ui-text);
		caret-color: var(--ui-caret);
		font: var(--ui-font);
		outline: none;
		transition: border-color var(--ui-duration);
	}
	input::placeholder {
		color: var(--ui-placeholder);
		opacity: 1;
	}
	.ui-input:not(.disabled):not(.invalid) input:hover:not(:focus) {
		border-color: var(--ui-hover);
	}
	input:focus {
		border-color: var(--ui-focus);
	}
	input:disabled {
		cursor: not-allowed;
	}
	.message {
		font: var(--ui-caption-font);
		color: var(--ui-caption);
	}
</style>

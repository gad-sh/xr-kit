// Token resolution and value math for Checkbox, Slider, Tag, Avatar and Tooltip, shared by the 2D and
// 3D renderers (Button has its own in button-style.ts). Erasable TypeScript only.
import type { Font, TagKind, TagSize, TagVariant, Theme, TooltipPlacement } from './theme';

export type CheckboxType = 'checkbox' | 'toggle';

export type CheckboxStyle = {
	// Control size (px): the box, or the switch track.
	width: number;
	height: number;
	radius: number;
	// Fill when unchecked (2D draws an outline instead, 3D a solid slab), and when checked.
	fill: string;
	fill3d: string;
	border: string;
	mark: string;
	knob: number;
	knobColor: string;
	labelColor: string;
	font: Font;
};

export function resolveCheckboxStyle(
	theme: Theme,
	{ type = 'checkbox', checked = false, disabled = false }: { type?: CheckboxType; checked?: boolean; disabled?: boolean } = {}
): CheckboxStyle {
	const t = theme.checkbox;
	const c = theme.colors.checkbox;
	const toggle = type === 'toggle';
	const on = toggle ? c.toggleTrackChecked : c.fillChecked;
	const off = toggle ? c.toggleTrack : 'transparent';
	const fill = disabled ? theme.colors.buttonDisabledFill : checked ? on : off;
	return {
		width: toggle ? t.trackWidth : t.box,
		height: toggle ? t.trackHeight : t.box,
		radius: toggle ? t.trackHeight / 2 : t.boxRadius,
		fill,
		fill3d: fill === 'transparent' ? c.fill3d : fill,
		border: disabled ? theme.colors.buttonDisabledFill : checked || toggle ? fill : c.border,
		mark: disabled ? theme.colors.buttonDisabledText : c.mark,
		knob: t.knob,
		knobColor: disabled ? theme.colors.buttonDisabledText : c.toggleKnob,
		labelColor: disabled ? theme.colors.buttonDisabledText : theme.colors.contentPrimary,
		font: theme.typography[t.typography],
	};
}

// Slider value <-> position along the track (0 = min end, 1 = max end).
export function sliderFraction(value: number, min: number, max: number): number {
	if (max <= min) return 0;
	return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

export function sliderValueAt(fraction: number, min: number, max: number, step = 1): number {
	const clamped = Math.min(1, Math.max(0, fraction));
	const raw = min + clamped * (max - min);
	if (!(step > 0)) return raw;
	const snapped = min + Math.round((raw - min) / step) * step;
	// Round off float noise (0.1 + 0.2) to the step's precision, and stay in range.
	const decimals = (String(step).split('.')[1] ?? '').length;
	return Math.min(max, Math.max(min, Number(snapped.toFixed(decimals))));
}

export type TagStyle = { height: number; paddingX: number; radius: number; fill: string; text: string; font: Font };

export function resolveTagStyle(
	theme: Theme,
	{ kind = 'neutral', variant = 'light', size = 'small' }: { kind?: TagKind; variant?: TagVariant; size?: TagSize } = {}
): TagStyle {
	const sizeTokens = theme.tag.sizes[size];
	const c = theme.colors.tag[kind];
	return {
		height: sizeTokens.height,
		paddingX: sizeTokens.paddingX,
		radius: Math.min(theme.tag.radius, sizeTokens.height / 2),
		fill: variant === 'solid' ? c.solidFill : c.lightFill,
		text: variant === 'solid' ? c.solidText : c.lightText,
		font: theme.typography[sizeTokens.typography],
	};
}

// Keyboard navigation over a list where some entries can't take focus (disabled
// items, dividers). Returns the next usable index in `direction`, or `from` if none.
export function nextIndex(usable: boolean[], from: number, direction: 1 | -1, wrap = true): number {
	const n = usable.length;
	for (let step = 1; step <= n; step++) {
		let i = from + direction * step;
		if (wrap) i = ((i % n) + n) % n;
		else if (i < 0 || i >= n) return from;
		if (usable[i]) return i;
	}
	return from;
}

export type InputStyle = {
	height: number;
	paddingX: number;
	radius: number;
	border: number;
	fill: string;
	borderColor: string;
	text: string;
	placeholder: string;
	caret: string;
	labelColor: string;
	captionColor: string;
	font: Font;
	labelFont: Font;
	captionFont: Font;
};

// Input field colors: the border shows hover, focus (accent) and error (wins over focus).
export function resolveInputStyle(
	theme: Theme,
	{ focused = false, hovered = false, error = false, disabled = false }: { focused?: boolean; hovered?: boolean; error?: boolean; disabled?: boolean } = {}
): InputStyle {
	const t = theme.input;
	const c = theme.colors.input;
	const fill = disabled ? theme.colors.buttonDisabledFill : c.fill;
	return {
		height: t.height,
		paddingX: t.paddingX,
		radius: t.radius,
		border: t.border,
		fill,
		borderColor: disabled ? fill : error ? c.error : focused ? c.focus : hovered ? c.hover : c.border,
		text: disabled ? theme.colors.buttonDisabledText : c.text,
		placeholder: disabled ? theme.colors.buttonDisabledText : c.placeholder,
		caret: c.caret,
		labelColor: disabled ? theme.colors.buttonDisabledText : c.label,
		captionColor: error ? c.errorText : c.caption,
		font: theme.typography[t.typography],
		labelFont: theme.typography[t.labelTypography],
		captionFont: theme.typography[t.captionTypography],
	};
}

// VR keyboard keys: letters, special keys (shift, backspace, pages…) and the accent
// enter key. Pressed flips to white so a laser press is unmistakable; `on` is a latched
// shift / caps.
export function resolveKeyStyle(
	theme: Theme,
	{ kind = 'char', hovered = false, pressed = false, on = false }: { kind?: 'char' | 'special' | 'accent'; hovered?: boolean; pressed?: boolean; on?: boolean } = {}
): { fill: string; text: string } {
	const c = theme.colors.keyboard;
	if (pressed) return { fill: c.pressed, text: c.pressedText };
	if (on) return { fill: c.on, text: c.onText };
	const [fill, hover] =
		kind === 'accent' ? [c.accent, c.accentHover] : kind === 'special' ? [c.special, c.specialHover] : [c.key, c.keyHover];
	return { fill: hovered ? hover : fill, text: c.text };
}

// Avatar initials: first letters of the first and last words ("Ada Lovelace" → "AL",
// "rhys" → "R"). Whole characters, so an emoji name keeps its emoji.
export function initials(name: string): string {
	const words = name.trim().split(/\s+/).filter(Boolean);
	if (!words.length) return '';
	const first = [...words[0]][0];
	const last = words.length > 1 ? [...words[words.length - 1]][0] : '';
	return (first + last).toUpperCase();
}

// A stable color per name, so the same player looks the same everywhere.
export function avatarColor(name: string, palette: string[]): string {
	let hash = 0;
	for (const ch of name.trim().toLowerCase()) hash = (hash * 31 + ch.codePointAt(0)!) >>> 0;
	return palette[hash % palette.length];
}

// Where a tooltip bubble's center goes relative to its trigger's center (3D, y up):
// `gap` clear of the trigger's edge on the `placement` side.
export function tooltipOffset(
	placement: TooltipPlacement,
	trigger: { width: number; height: number },
	bubble: { width: number; height: number },
	gap: number
): { x: number; y: number } {
	switch (placement) {
		case 'bottom':
			return { x: 0, y: -(trigger.height / 2 + gap + bubble.height / 2) };
		case 'left':
			return { x: -(trigger.width / 2 + gap + bubble.width / 2), y: 0 };
		case 'right':
			return { x: trigger.width / 2 + gap + bubble.width / 2, y: 0 };
		default:
			return { x: 0, y: trigger.height / 2 + gap + bubble.height / 2 };
	}
}

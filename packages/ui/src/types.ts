import type { Snippet } from 'svelte';
import type { ButtonKind, ButtonShape, ButtonSize, Dimension, TypographyVariant } from './theme';

export type ButtonProps = {
	// The label. Required in 3D (troika renders plain strings); in 2D `children` can replace it.
	label?: string;
	children?: Snippet;
	kind?: ButtonKind;
	size?: ButtonSize;
	shape?: ButtonShape;
	isSelected?: boolean;
	disabled?: boolean;
	// Not clickable, but looks unchanged (e.g. a menu that's sliding away).
	inert?: boolean;
	onclick?: (event: Event) => void;
	dimension?: Dimension;
	// Anything else goes on the root element: <button> in 2D, <a-entity> in 3D.
	[attribute: string]: unknown;
};

export type TextProps = {
	text?: string;
	children?: Snippet;
	variant?: TypographyVariant;
	color?: string;
	align?: 'left' | 'center' | 'right';
	// px; wraps longer text.
	maxWidth?: number;
	dimension?: Dimension;
	[attribute: string]: unknown;
};

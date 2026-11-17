// Resolves a Button's tokens for both renderers, so 2D and 3D can't drift apart.
import type { ButtonKind, ButtonShape, ButtonSize, Font, Material3D, Theme } from './theme';

export type ButtonStyleInput = {
	kind?: ButtonKind;
	size?: ButtonSize;
	shape?: ButtonShape;
	selected?: boolean;
	disabled?: boolean;
};

export type ButtonStyle = {
	height: number;
	paddingX: number;
	radius: number;
	// round / circle / square buttons are as wide as they are tall.
	square: boolean;
	font: Font;
	fill: string;
	hoverFill: string;
	activeFill: string;
	text: string;
	// 3D only: what the slab is made of, and the label color on it.
	material: Material3D;
	text3d: string;
};

export function resolveButtonStyle(theme: Theme, input: ButtonStyleInput = {}): ButtonStyle {
	const { kind = 'primary', size = 'default', shape = 'default', selected = false, disabled = false } = input;
	const sizeTokens = theme.button.sizes[size];
	const height = sizeTokens.height;
	const square = shape === 'round' || shape === 'circle' || shape === 'square';
	const fullyRounded = shape === 'pill' || shape === 'round' || shape === 'circle';
	const radius = fullyRounded ? height / 2 : Math.min(theme.borders.buttonBorderRadius, height / 2);
	const base = {
		height,
		paddingX: square ? 0 : sizeTokens.paddingX,
		radius,
		square,
		font: theme.typography[sizeTokens.typography],
	};

	if (disabled) {
		const c = theme.colors;
		return { ...base, fill: c.buttonDisabledFill, hoverFill: c.buttonDisabledFill, activeFill: c.buttonDisabledFill, text: c.buttonDisabledText, material: 'solid', text3d: c.buttonDisabledText };
	}

	const colors = theme.colors.button[kind];
	if (selected) {
		return { ...base, fill: colors.selectedFill, hoverFill: colors.selectedFill, activeFill: colors.active, text: colors.selectedText, material: 'solid', text3d: colors.selectedText };
	}

	const material = theme.space3d.material[kind];
	return {
		...base,
		fill: colors.fill,
		hoverFill: colors.hover,
		activeFill: colors.active,
		text: colors.text,
		material,
		// Glass ignores the fill color, so it gets its own label color.
		text3d: material === 'glass' ? theme.space3d.glassText : colors.text,
	};
}

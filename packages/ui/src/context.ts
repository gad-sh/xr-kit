// Svelte context for the design system: the active theme, whether a subtree
// renders as HTML or A-Frame, and the ButtonGroup a Button belongs to.
import { getContext, setContext } from 'svelte';
import { defaultTheme } from './theme';
import type { ButtonKind, ButtonShape, ButtonSize, Dimension, Theme } from './theme';

const THEME = Symbol('ui-theme');
const DIMENSION = Symbol('ui-dimension');
const GROUP = Symbol('ui-button-group');

// Contexts hold getters so a ThemeProvider whose `theme` prop changes updates its children.
export function setTheme(get: () => Theme) {
	setContext(THEME, get);
}

export function getTheme(): () => Theme {
	return getContext<(() => Theme) | undefined>(THEME) ?? (() => defaultTheme);
}

export function setDimension(dimension: Dimension) {
	setContext(DIMENSION, dimension);
}

export function getDimension(): Dimension {
	return getContext<Dimension | undefined>(DIMENSION) ?? '2d';
}

export type ButtonGroupContext = {
	readonly kind?: ButtonKind;
	readonly size?: ButtonSize;
	readonly shape?: ButtonShape;
	readonly disabled: boolean;
	// Called once by each Button as it's created; returns its index in the group.
	register(): number;
	isSelected(index: number): boolean | undefined;
	select(index: number): void;
};

export function setButtonGroup(group: ButtonGroupContext) {
	setContext(GROUP, group);
}

export function getButtonGroup(): ButtonGroupContext | undefined {
	return getContext<ButtonGroupContext | undefined>(GROUP);
}

// Design tokens, Base UI style. Everything is in px; 3D converts with
// `space3d.metersPerPx`, so one set of numbers drives both HTML and A-Frame.
// Keep this file erasable TypeScript only (no enums) — tests import it with Node's type stripping.

export type ButtonKind = 'primary' | 'secondary' | 'tertiary';
export type ButtonSize = 'mini' | 'compact' | 'default' | 'large';
export type ButtonShape = 'default' | 'pill' | 'round' | 'circle' | 'square';
export type Dimension = '2d' | '3d';
export type Material3D = 'glass' | 'solid' | 'none';
export type TagKind = 'neutral' | 'accent' | 'positive' | 'warning' | 'negative';
export type TagVariant = 'solid' | 'light';
export type TagSize = 'small' | 'medium';
export type SpinnerSize = 'small' | 'medium' | 'large';
export type ToastKind = 'info' | 'positive' | 'warning' | 'negative';
export type ProgressBarSize = 'small' | 'medium' | 'large';
export type AvatarSize = 'small' | 'medium' | 'large';
export type AvatarStatus = 'online' | 'away' | 'busy' | 'offline';
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
export type TypographyVariant =
	| 'LabelXSmall'
	| 'LabelSmall'
	| 'LabelMedium'
	| 'LabelLarge'
	| 'HeadingSmall'
	| 'HeadingMedium'
	| 'ParagraphMedium';

export type Font = { fontSize: number; lineHeight: number; fontWeight: number };

type TagColors = { solidFill: string; solidText: string; lightFill: string; lightText: string };
type KindColors = { fill: string; text: string; hover: string; active: string; selectedFill: string; selectedText: string };

const primitives = {
	white: '#FFFFFF',
	black: '#000000',
	gray50: '#F6F6F6',
	gray100: '#EEEEEE',
	gray200: '#E2E2E2',
	gray300: '#CBCBCB',
	gray400: '#AFAFAF',
	gray500: '#757575',
	gray600: '#545454',
	gray700: '#333333',
	gray800: '#1F1F1F',
	gray900: '#141414',
	accent: '#276EF1',
	accent400: '#5B91F5',
	negative: '#E11900',
	positive: '#05944F',
	warning: '#FFC043',
};

const typography: Record<TypographyVariant, Font> & { fontFamily: string; font3d: string } = {
	fontFamily: "Geist, system-ui, 'Segoe UI', Roboto, sans-serif",
	// Font URL for 3D text (troika loads it directly). Empty = the bundled Geist (fonts.ts).
	font3d: '',
	LabelXSmall: { fontSize: 12, lineHeight: 16, fontWeight: 500 },
	LabelSmall: { fontSize: 14, lineHeight: 16, fontWeight: 500 },
	LabelMedium: { fontSize: 16, lineHeight: 20, fontWeight: 500 },
	LabelLarge: { fontSize: 18, lineHeight: 24, fontWeight: 500 },
	HeadingSmall: { fontSize: 20, lineHeight: 28, fontWeight: 600 },
	HeadingMedium: { fontSize: 24, lineHeight: 32, fontWeight: 600 },
	ParagraphMedium: { fontSize: 16, lineHeight: 24, fontWeight: 400 },
};

// Dark by default: the world and page background are black.
export const defaultTheme = {
	name: 'dark',
	colors: {
		...primitives,
		contentPrimary: primitives.white,
		contentSecondary: primitives.gray300,
		contentTertiary: primitives.gray500,
		backgroundPrimary: primitives.black,
		backgroundSecondary: primitives.gray800,
		button: {
			primary: {
				fill: primitives.white,
				text: primitives.black,
				hover: primitives.gray200,
				active: primitives.gray300,
				selectedFill: primitives.accent,
				selectedText: primitives.white,
			},
			secondary: {
				fill: primitives.gray700,
				text: primitives.white,
				hover: primitives.gray600,
				active: primitives.gray500,
				selectedFill: primitives.accent,
				selectedText: primitives.white,
			},
			tertiary: {
				fill: 'transparent',
				text: primitives.white,
				hover: primitives.gray800,
				active: primitives.gray700,
				selectedFill: primitives.gray700,
				selectedText: primitives.accent400,
			},
		} as Record<ButtonKind, KindColors>,
		buttonDisabledFill: primitives.gray800,
		buttonDisabledText: primitives.gray600,
		panel: { fill: primitives.gray900, border: primitives.gray800 },
		checkbox: {
			border: primitives.gray500,
			// 3D has no outline, so an unchecked box is a solid slab.
			fill3d: primitives.gray700,
			fillChecked: primitives.accent,
			mark: primitives.white,
			toggleTrack: primitives.gray600,
			toggleTrackChecked: primitives.accent,
			toggleKnob: primitives.white,
		},
		slider: { track: primitives.gray700, fill: primitives.accent, thumb: primitives.white },
		tag: {
			neutral: { solidFill: primitives.gray600, solidText: primitives.white, lightFill: primitives.gray800, lightText: primitives.gray200 },
			accent: { solidFill: primitives.accent, solidText: primitives.white, lightFill: '#14284F', lightText: primitives.accent400 },
			positive: { solidFill: primitives.positive, solidText: primitives.white, lightFill: '#0B3B24', lightText: '#3AA76D' },
			warning: { solidFill: primitives.warning, solidText: primitives.black, lightFill: '#4A3810', lightText: primitives.warning },
			negative: { solidFill: primitives.negative, solidText: primitives.white, lightFill: '#4A140E', lightText: '#F1998E' },
		} as Record<TagKind, TagColors>,
		spinner: { track: primitives.gray700, active: primitives.accent },
		input: {
			fill: primitives.gray800,
			border: primitives.gray700,
			hover: primitives.gray600,
			focus: primitives.accent,
			error: primitives.negative,
			text: primitives.white,
			placeholder: primitives.gray500,
			caret: primitives.accent400,
			label: primitives.white,
			caption: primitives.gray400,
			errorText: '#F1998E',
		},
		keyboard: {
			fill: primitives.gray900,
			key: primitives.gray700,
			keyHover: primitives.gray500,
			special: primitives.gray800,
			specialHover: primitives.gray600,
			accent: primitives.accent,
			accentHover: primitives.accent400,
			pressed: primitives.white,
			pressedText: primitives.black,
			on: primitives.gray200,
			onText: primitives.black,
			text: primitives.white,
		},
		tabs: { text: primitives.gray400, textActive: primitives.white, hover: primitives.gray800, indicator: primitives.accent, border: primitives.gray800 },
		menu: {
			fill: primitives.gray900,
			border: primitives.gray800,
			hover: primitives.gray800,
			active: primitives.gray700,
			text: primitives.white,
			end: primitives.gray500,
			selected: primitives.accent400,
			divider: primitives.gray800,
		},
		modal: { fill: primitives.gray900, backdrop: primitives.black, backdropOpacity: 0.6 },
		radial: { fill: primitives.gray800, active: primitives.accent, text: primitives.white, disabledText: primitives.gray600, ring: primitives.gray900 },
		toast: {
			info: { fill: '#14284F', text: primitives.white, accent: primitives.accent400 },
			positive: { fill: '#0B3B24', text: primitives.white, accent: '#3AA76D' },
			warning: { fill: '#4A3810', text: primitives.white, accent: primitives.warning },
			negative: { fill: '#4A140E', text: primitives.white, accent: '#F1998E' },
		} as Record<ToastKind, { fill: string; text: string; accent: string }>,
		progressBar: { track: primitives.gray700, fill: primitives.accent },
		avatar: {
			// Picked per name (avatarColor), so a player keeps the same color everywhere.
			palette: [primitives.accent, '#7356BF', primitives.positive, '#FF6937', '#E11900', '#0E8AA8'],
			text: primitives.white,
			// Around the status dot, to cut it out of the avatar (the panel color).
			statusRing: primitives.gray900,
			status: { online: primitives.positive, away: primitives.warning, busy: primitives.negative, offline: primitives.gray500 } as Record<AvatarStatus, string>,
		},
		// Light on the dark UI, so it reads as floating above it.
		tooltip: { fill: primitives.gray200, text: primitives.black },
	},
	sizing: {
		scale0: 2,
		scale100: 4,
		scale200: 6,
		scale300: 8,
		scale400: 10,
		scale500: 12,
		scale550: 14,
		scale600: 16,
		scale700: 20,
		scale800: 24,
		scale900: 32,
		scale1000: 40,
		scale1200: 48,
		scale1400: 56,
		scale1600: 64,
	},
	borders: {
		radius100: 2,
		radius200: 4,
		radius300: 8,
		radius400: 12,
		radius500: 16,
		buttonBorderRadius: 16,
	},
	typography,
	animation: {
		timing100: 100,
		timing200: 200,
		timing300: 300,
		timing400: 400,
		timing500: 500,
		easeOutCurve: 'cubic-bezier(.2, .8, .4, 1)',
		easeInOutCurve: 'cubic-bezier(.8, .2, .6, 1)',
		// A-Frame animation component easing names
		easeOut3d: 'easeOutQuad',
		easeInOut3d: 'easeInOutQuad',
	},
	button: {
		sizes: {
			mini: { height: 28, paddingX: 8, typography: 'LabelXSmall' },
			compact: { height: 36, paddingX: 12, typography: 'LabelSmall' },
			default: { height: 48, paddingX: 16, typography: 'LabelMedium' },
			large: { height: 56, paddingX: 20, typography: 'LabelLarge' },
		} as Record<ButtonSize, { height: number; paddingX: number; typography: TypographyVariant }>,
	},
	panel: { padding: 24, gap: 16, radius: 24 },
	checkbox: {
		box: 20,
		boxRadius: 4,
		trackWidth: 40,
		trackHeight: 24,
		knob: 18,
		// Between the control and its label.
		gap: 10,
		typography: 'LabelMedium' as TypographyVariant,
	},
	slider: { width: 240, trackHeight: 4, thumb: 20, gap: 8, typography: 'LabelSmall' as TypographyVariant },
	tag: {
		radius: 8,
		sizes: {
			small: { height: 24, paddingX: 8, typography: 'LabelXSmall' },
			medium: { height: 32, paddingX: 12, typography: 'LabelSmall' },
		} as Record<TagSize, { height: number; paddingX: number; typography: TypographyVariant }>,
	},
	tabs: { height: 40, paddingX: 12, gap: 4, indicator: 2, radius: 8, typography: 'LabelMedium' as TypographyVariant },
	menu: {
		itemHeight: 40,
		paddingX: 12,
		// Around the list, inside the menu's background.
		padding: 6,
		radius: 12,
		itemRadius: 8,
		minWidth: 200,
		typography: 'LabelMedium' as TypographyVariant,
		endTypography: 'LabelSmall' as TypographyVariant,
	},
	modal: { width: 420 },
	input: {
		width: 280,
		height: 48,
		paddingX: 14,
		radius: 12,
		border: 2,
		// Between the label, the field and the caption.
		gap: 6,
		caretWidth: 2,
		typography: 'ParagraphMedium' as TypographyVariant,
		labelTypography: 'LabelSmall' as TypographyVariant,
		captionTypography: 'LabelXSmall' as TypographyVariant,
	},
	// VR keyboard. `key` is one key unit (a letter key is key × key).
	keyboard: {
		key: 52,
		gap: 6,
		padding: 14,
		radius: 10,
		typography: 'LabelLarge' as TypographyVariant,
		// Word labels (space, Done, 123, Send).
		wordTypography: 'LabelMedium' as TypographyVariant,
	},
	// px. Labels are shrunk to fit small rings (at most half the radius).
	radial: { radius: 110, innerRadius: 34, gap: 3, deadzone: 24, typography: 'LabelLarge' as TypographyVariant },
	toast: { width: 320, padding: 16 },
	spinner: { sizes: { small: 24, medium: 32, large: 48 } as Record<SpinnerSize, number>, thickness: 0.125 },
	progressBar: {
		width: 240,
		// Bar thickness.
		sizes: { small: 4, medium: 8, large: 12 } as Record<ProgressBarSize, number>,
		// Between the label row and the bar.
		gap: 8,
		typography: 'LabelSmall' as TypographyVariant,
		// Indeterminate (`infinite`): the moving segment's share of the bar, and one pass (ms).
		segment: 0.3,
		duration: 1200,
	},
	avatar: {
		sizes: { small: 24, medium: 40, large: 64 } as Record<AvatarSize, number>,
		// Initials size and status dot diameter, as a fraction of the avatar.
		initials: 0.4,
		status: 0.3,
		statusRing: 2,
	},
	tooltip: { paddingX: 10, paddingY: 6, radius: 8, gap: 8, maxWidth: 240, delay: 400, typography: 'LabelSmall' as TypographyVariant },
	space3d: {
		// A default (48px) button comes out 0.15 m tall, the size of the original menu buttons.
		metersPerPx: 0.003125,
		// Text needs to be relatively bigger in-world: 16px label → 0.075 m.
		textScale: 1.5,
		// Slab thickness (meters).
		depth: 0.05,
		hoverScale: 1.04,
		pressDepth: 0.02,
		material: { primary: 'glass', secondary: 'solid', tertiary: 'none' } as Record<ButtonKind, Material3D>,
		panelOpacity: 0.92,
		// Raised parts (switch knob, slider thumb) sit this far in front of their track.
		raise: 0.012,
		// Label color on glass, which ignores the fill color.
		glassText: primitives.white,
	},
};

export type Theme = typeof defaultTheme;

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function merge<T>(base: T, overrides: unknown): T {
	if (!isPlainObject(base) || !isPlainObject(overrides)) return (overrides ?? base) as T;
	const out: Record<string, unknown> = { ...base };
	for (const [key, value] of Object.entries(overrides)) {
		if (value === undefined) continue;
		out[key] = isPlainObject(value) && isPlainObject(out[key]) ? merge(out[key], value) : value;
	}
	return out as T;
}

// Like Base UI's createTheme: start from the default theme and override any token.
export function createTheme(overrides: DeepPartial<Theme> = {}, base: Theme = defaultTheme): Theme {
	return merge(base, overrides);
}

export function toMeters(theme: Theme, px: number): number {
	return px * theme.space3d.metersPerPx;
}

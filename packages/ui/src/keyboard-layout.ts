// The VR keyboard's keys and shift logic. Three pages: letters (QWERTY), numbers and
// symbols. Widths are in key units; every row adds up to ROW_UNITS, so rows line up.
// Labels stick to glyphs the bundled Geist has (no ⌫ / ✓), so troika needn't fetch
// a fallback font. Erasable TypeScript only (tested in Node).

export type KeyboardPage = 'letters' | 'numbers' | 'symbols';
export type ShiftState = 'off' | 'once' | 'caps';
export type EnterKeyHint = 'enter' | 'done' | 'go' | 'next' | 'search' | 'send';

export type KeyDef =
	| { action: 'char'; char: string; width?: number }
	| { action: 'shift' | 'backspace' | 'space' | 'enter' | 'done' | 'close'; width: number }
	| { action: 'page'; page: KeyboardPage; width: number }
	// Empty room (the half-key indent of the middle row).
	| { action: 'spacer'; width: number };

export const ROW_UNITS = 11.5;

const chars = (s: string): KeyDef[] => [...s].map((char) => ({ action: 'char', char }));

const backspace: KeyDef = { action: 'backspace', width: 1.5 };
const indent: KeyDef = { action: 'spacer', width: 0.5 };
const enter: KeyDef = { action: 'enter', width: 2 };
const bottom = (page: KeyboardPage): KeyDef[] => [
	{ action: 'page', page, width: 1.5 },
	{ action: 'close', width: 1.25 },
	{ action: 'space', width: 6.25 },
	{ action: 'done', width: 2.5 },
];

export const KEYBOARD: Record<KeyboardPage, KeyDef[][]> = {
	letters: [
		[...chars('qwertyuiop'), backspace],
		[indent, ...chars('asdfghjkl'), enter],
		[{ action: 'shift', width: 1.5 }, ...chars('zxcvbnm,.?')],
		bottom('numbers'),
	],
	numbers: [
		[...chars('1234567890'), backspace],
		[indent, ...chars('-/:;()$&@'), enter],
		[{ action: 'page', page: 'symbols', width: 1.5 }, ...chars(`.,?!'"_*%+`)],
		bottom('letters'),
	],
	symbols: [
		[...chars('[]{}#^=<>~'), backspace],
		[indent, ...chars('\\|`€£¥•°…'), enter],
		[{ action: 'page', page: 'numbers', width: 1.5 }, ...chars(`.,?!'"_*%+`)],
		bottom('letters'),
	],
};

export const keyWidth = (key: KeyDef) => ('width' in key && key.width ? key.width : 1);

const PAGE_LABEL: Record<KeyboardPage, string> = { letters: 'ABC', numbers: '123', symbols: '#+=' };
const ENTER_LABEL: Record<EnterKeyHint, string> = { enter: '↵', done: 'Done', go: 'Go', next: 'Next', search: 'Search', send: 'Send' };

export function keyLabel(key: KeyDef, shift: ShiftState = 'off', enterKeyHint: EnterKeyHint = 'enter'): string {
	switch (key.action) {
		case 'char':
			return keyChar(key, shift);
		case 'shift':
			return shift === 'caps' ? 'CAPS' : '⇧';
		case 'backspace':
			return '←';
		case 'space':
			return 'space';
		case 'enter':
			return ENTER_LABEL[enterKeyHint];
		case 'done':
			return 'Done';
		case 'close':
			return '×';
		case 'page':
			return PAGE_LABEL[key.page];
		case 'spacer':
			return '';
	}
}

// What a character key types.
export function keyChar(key: { char: string }, shift: ShiftState): string {
	return shift === 'off' ? key.char : key.char.toUpperCase();
}

// Shift: a tap shifts the next letter; a second tap within `doubleTapMs` locks caps;
// any tap while locked (or a slow second tap) turns it off.
export function tapShift(shift: ShiftState, msSinceLastTap: number, doubleTapMs = 400): ShiftState {
	if (shift === 'off') return 'once';
	if (shift === 'once' && msSinceLastTap <= doubleTapMs) return 'caps';
	return 'off';
}

// After typing a character, a one-shot shift is used up; caps stays.
export const afterChar = (shift: ShiftState): ShiftState => (shift === 'once' ? 'off' : shift);

// The page a field opens on.
export const startPage = (inputmode: 'text' | 'numeric'): KeyboardPage => (inputmode === 'numeric' ? 'numbers' : 'letters');

// Text editing for the 3D Input (and its VR keyboard): a value plus a caret, changed
// by splices. Every edit is one splice (`at`, `remove` chars, `insert` text), the form
// a shared, networked document would send. Erasable TypeScript only (tested in Node).

export type TextState = { text: string; caret: number };
export type Splice = { at: number; remove: number; insert: string };
export type Edit = { state: TextState; splice: Splice };
export type EditOptions = { multiline?: boolean; maxLength?: number };

export type EditAction =
	| { type: 'insert'; text: string }
	| { type: 'backspace' }
	| { type: 'delete' }
	| { type: 'left' }
	| { type: 'right' }
	| { type: 'home' }
	| { type: 'end' };

const isHigh = (code: number) => code >= 0xd800 && code <= 0xdbff;
const isLow = (code: number) => code >= 0xdc00 && code <= 0xdfff;

export function clampCaret(text: string, caret: number): number {
	const c = Math.min(text.length, Math.max(0, Math.round(caret) || 0));
	// Never inside a surrogate pair (emoji etc.).
	return c > 0 && c < text.length && isLow(text.charCodeAt(c)) && isHigh(text.charCodeAt(c - 1)) ? c - 1 : c;
}

// One character step left/right, keeping surrogate pairs together.
function step(text: string, caret: number, direction: 1 | -1): number {
	const next = caret + direction;
	if (next < 0 || next > text.length) return caret;
	if (direction < 0 && next > 0 && isLow(text.charCodeAt(next)) && isHigh(text.charCodeAt(next - 1))) return next - 1;
	if (direction > 0 && next < text.length && isLow(text.charCodeAt(next)) && isHigh(text.charCodeAt(next - 1))) return next + 1;
	return next;
}

// What may be typed: no control characters; newlines only when multiline (else spaces).
export function sanitize(text: string, multiline = false): string {
	const lines = text.replace(/\r\n?/g, '\n');
	const flat = multiline ? lines : lines.replace(/\n+/g, ' ');
	// eslint-disable-next-line no-control-regex
	return flat.replace(/\t/g, ' ').replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '');
}

export function applySplice(text: string, { at, remove, insert }: Splice): string {
	return text.slice(0, at) + insert + text.slice(at + remove);
}

function spliceEdit(state: TextState, splice: Splice, caret: number): Edit | null {
	if (!splice.remove && !splice.insert) return null;
	return { state: { text: applySplice(state.text, splice), caret }, splice };
}

// Applies an editing action. Returns null when nothing changes (e.g. backspace at the
// start); caret-only moves return a state with an empty splice.
export function edit(state: TextState, action: EditAction, { multiline = false, maxLength }: EditOptions = {}): Edit | null {
	const text = state.text;
	const caret = clampCaret(text, state.caret);
	const move = (to: number): Edit | null => (to === caret ? null : { state: { text, caret: to }, splice: { at: to, remove: 0, insert: '' } });
	switch (action.type) {
		case 'insert': {
			let insert = sanitize(action.text, multiline);
			if (maxLength !== undefined) insert = insert.slice(0, Math.max(0, maxLength - text.length));
			// Don't cut a surrogate pair in half at the limit.
			if (insert && isHigh(insert.charCodeAt(insert.length - 1))) insert = insert.slice(0, -1);
			return spliceEdit({ text, caret }, { at: caret, remove: 0, insert }, caret + insert.length);
		}
		case 'backspace': {
			const from = step(text, caret, -1);
			return spliceEdit({ text, caret }, { at: from, remove: caret - from, insert: '' }, from);
		}
		case 'delete': {
			const to = step(text, caret, 1);
			return spliceEdit({ text, caret }, { at: caret, remove: to - caret, insert: '' }, caret);
		}
		case 'left':
			return move(step(text, caret, -1));
		case 'right':
			return move(step(text, caret, 1));
		case 'home':
			return move(0);
		case 'end':
			return move(text.length);
	}
}

// Physical keyboard → editing action. `enter` / `escape` are the field's own (submit /
// cancel). Returns null for keys a text field leaves alone (shortcuts with Cmd/Ctrl,
// function keys), so they keep working.
export function keyToAction(event: { key: string; ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean }): EditAction | 'enter' | 'escape' | null {
	if (event.ctrlKey || event.metaKey) return null;
	switch (event.key) {
		case 'Enter':
			return 'enter';
		case 'Escape':
			return 'escape';
		case 'Backspace':
			return { type: 'backspace' };
		case 'Delete':
			return { type: 'delete' };
		case 'ArrowLeft':
			return { type: 'left' };
		case 'ArrowRight':
			return { type: 'right' };
		case 'Home':
		case 'ArrowUp':
			return { type: 'home' };
		case 'End':
		case 'ArrowDown':
			return { type: 'end' };
	}
	// Printable characters have a one-character key (two for astral, e.g. emoji).
	return [...event.key].length === 1 ? { type: 'insert', text: event.key } : null;
}

// ---- Caret placement (troika `caretPositions`: startX, endX, bottomY, topY per char) ----

// x of the caret before character `index` (after the last one at index = length).
export function caretX(index: number, positions: ArrayLike<number> | null | undefined, length: number): number {
	if (!positions || !length) return 0;
	const i = Math.min(Math.max(index, 0), length);
	return i < length ? positions[i * 4] : positions[(length - 1) * 4 + 1];
}

// The caret index nearest to x (text-local) — where a click puts the caret.
export function caretIndexAt(x: number, positions: ArrayLike<number> | null | undefined, length: number): number {
	if (!positions || !length) return 0;
	let best = 0;
	let bestDistance = Infinity;
	for (let i = 0; i <= length; i++) {
		const distance = Math.abs(caretX(i, positions, length) - x);
		if (distance < bestDistance) {
			best = i;
			bestDistance = distance;
		}
	}
	return best;
}

// Horizontal scroll (how far the text is shifted left) that keeps the caret inside a
// window `viewWidth` wide, moving as little as possible; `textWidth` stops it
// scrolling past the end of the text.
export function scrollToCaret(caret: number, scroll: number, viewWidth: number, textWidth: number): number {
	let next = scroll;
	if (caret - next > viewWidth) next = caret - viewWidth;
	if (caret - next < 0) next = caret;
	return Math.min(Math.max(next, 0), Math.max(0, textWidth - viewWidth));
}

// Which 3D text field has focus (one per page), and the input it gets: the physical
// keyboard on desktop, the VR <Keyboard> in a headset. A field registers as an
// `Editable`; the keyboard and key handling only talk to that, so other kinds of
// fields (e.g. a multi-line one) can plug in later.
import type { EnterKeyHint } from './keyboard-layout';
import { keyToAction, type EditAction } from './text-edit';

export type Editable = {
	readonly text: string;
	readonly caret: number;
	readonly placeholder: string;
	readonly inputmode: 'text' | 'numeric';
	readonly enterKeyHint: EnterKeyHint;
	// The field's root entity: pressing the cursor inside it keeps focus.
	readonly el: Element | undefined;
	edit(action: EditAction): void;
	setCaret(index: number): void;
	// Enter: submit.
	enter(): void;
	// Done / clicking elsewhere: stop editing, keep the text.
	done(): void;
	// Escape / close: put the text back as it was, stop editing.
	cancel(): void;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
class TextFocus {
	// Raw: a deep $state would hold a proxy, and `current === field` would never match.
	current = $state.raw<Editable | null>(null);
	// Mounted <Keyboard> roots: pressing inside them keeps focus too.
	readonly keyboards = new Set<Element>();

	focus(field: Editable) {
		if (this.current === field) return;
		this.current?.done();
		this.current = field;
		listen(field.el);
	}

	blur(field: Editable) {
		if (this.current === field) this.current = null;
	}

	contains(target: unknown): boolean {
		if (!(target instanceof Element)) return false;
		if (this.current?.el?.contains(target)) return true;
		for (const keyboard of this.keyboards) if (keyboard.contains(target)) return true;
		return false;
	}
}

export const textFocus = new TextFocus();

// Native fields (2D Inputs, other HTML) keep their own keys.
function isNativeEditable(target: EventTarget | null) {
	return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
}

// Capture phase, before the page's own shortcuts and movement controls (all on window):
// while a 3D field has focus, it gets every key except Cmd/Ctrl shortcuts.
function onKeydown(event: KeyboardEvent) {
	const field = textFocus.current;
	if (!field || isNativeEditable(event.target) || event.ctrlKey || event.metaKey) return;
	event.stopImmediatePropagation();
	event.preventDefault();
	takenKeys.add(keyId(event));
	const action = keyToAction(event);
	if (action === 'enter') field.enter();
	else if (action === 'escape') field.cancel();
	else if (action) field.edit(action);
}

// The keyup of a key the field took is taken too, even once editing has ended (Enter,
// Escape): A-Frame's keyboard-shortcuts acts on keyup (F enters VR, which on desktop is
// fullscreen). A key already down before focus keeps its keyup, so movement controls
// see it released.
const takenKeys = new Set<string>();
const keyId = (event: KeyboardEvent) => event.code || event.key;

function onKeyup(event: KeyboardEvent) {
	if (!takenKeys.delete(keyId(event))) return;
	event.stopImmediatePropagation();
	event.preventDefault();
}

function onPaste(event: ClipboardEvent) {
	const field = textFocus.current;
	const text = event.clipboardData?.getData('text/plain');
	if (!field || isNativeEditable(event.target) || !text) return;
	event.preventDefault();
	field.edit({ type: 'insert', text });
}

// Any cursor press (mouse or VR laser) on something other than the field or the
// keyboard — including on nothing — ends editing. The cursor emits mousedown on itself
// with what it hit (`intersectedEl`, no `cursorEl`), and that bubbles to the scene.
function onCursorDown(event: Event) {
	const detail = (event as CustomEvent).detail;
	if (!textFocus.current || !detail || !(event.target as any)?.components?.cursor) return;
	if (!textFocus.contains(detail.intersectedEl)) textFocus.current.done();
}

// Clicking HTML outside the 3D canvas ends editing as well.
function onPointerDown(event: PointerEvent) {
	if (textFocus.current && !(event.target instanceof HTMLCanvasElement)) textFocus.current.done();
}

let windowListening = false;
const scenes = new WeakSet<object>();

function listen(el: Element | undefined) {
	if (!windowListening) {
		windowListening = true;
		window.addEventListener('keydown', onKeydown, true);
		window.addEventListener('keyup', onKeyup, true);
		window.addEventListener('pointerdown', onPointerDown, true);
		document.addEventListener('paste', onPaste);
	}
	const scene = (el as any)?.sceneEl ?? el?.closest('a-scene');
	if (scene && !scenes.has(scene)) {
		scenes.add(scene);
		scene.addEventListener('mousedown', onCursorDown);
	}
}

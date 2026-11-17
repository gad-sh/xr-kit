// Input editing model and VR keyboard layout (src/text-edit.ts, keyboard-layout.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultTheme as theme } from '../src/theme.ts';
import { resolveInputStyle, resolveKeyStyle } from '../src/component-style.ts';
import { applySplice, caretIndexAt, caretX, clampCaret, edit, keyToAction, sanitize, scrollToCaret } from '../src/text-edit.ts';
import { KEYBOARD, ROW_UNITS, afterChar, keyChar, keyLabel, keyWidth, startPage, tapShift } from '../src/keyboard-layout.ts';

// Runs actions from a starting state; returns the final state.
function run(text, caret, actions, options) {
  let state = { text, caret };
  for (const action of actions) state = edit(state, action, options)?.state ?? state;
  return state;
}
const ins = (text) => ({ type: 'insert', text });

test('typing inserts at the caret and moves it past the new text', () => {
  assert.deepEqual(run('', 0, [ins('h'), ins('i')]), { text: 'hi', caret: 2 });
  assert.deepEqual(run('hllo', 1, [ins('e')]), { text: 'hello', caret: 2 });
  assert.deepEqual(run('world', 0, [ins('hello ')]), { text: 'hello world', caret: 6 });
});

test('backspace and delete remove around the caret, and do nothing at the ends', () => {
  assert.deepEqual(run('hello', 5, [{ type: 'backspace' }]), { text: 'hell', caret: 4 });
  assert.deepEqual(run('hello', 2, [{ type: 'backspace' }]), { text: 'hllo', caret: 1 });
  assert.deepEqual(run('hello', 2, [{ type: 'delete' }]), { text: 'helo', caret: 2 });
  assert.equal(edit({ text: 'hi', caret: 0 }, { type: 'backspace' }), null);
  assert.equal(edit({ text: 'hi', caret: 2 }, { type: 'delete' }), null);
});

test('caret moves stop at the ends; home and end jump', () => {
  assert.deepEqual(run('abc', 1, [{ type: 'left' }, { type: 'left' }, { type: 'left' }]), { text: 'abc', caret: 0 });
  assert.deepEqual(run('abc', 1, [{ type: 'right' }, { type: 'right' }, { type: 'right' }]), { text: 'abc', caret: 3 });
  assert.deepEqual(run('abc', 1, [{ type: 'end' }]), { text: 'abc', caret: 3 });
  assert.deepEqual(run('abc', 1, [{ type: 'home' }, ins('>')]), { text: '>abc', caret: 1 });
  // A move that goes nowhere is no edit.
  assert.equal(edit({ text: 'abc', caret: 0 }, { type: 'home' }), null);
});

test('every edit is one splice that reproduces the new text', () => {
  const steps = [ins('hey'), { type: 'left' }, { type: 'backspace' }, ins('Y'), { type: 'home' }, { type: 'delete' }, ins('paste me\nin')];
  let state = { text: 'start', caret: 2 };
  for (const action of steps) {
    const result = edit(state, action);
    if (!result) continue;
    assert.equal(applySplice(state.text, result.splice), result.state.text);
    state = result.state;
  }
  // start → sthey|art → sthe|yart → sth|yart → sthY|yart → |sthYyart → |thYyart → paste…
  assert.deepEqual(state, { text: 'paste me inthYyart', caret: 11 });
});

test('a caret set from outside is clamped (e.g. a chat field cleared after sending)', () => {
  assert.equal(clampCaret('', 7), 0);
  assert.equal(clampCaret('abc', -2), 0);
  assert.equal(clampCaret('abc', 9), 3);
  assert.equal(clampCaret('abc', NaN), 0);
  assert.deepEqual(run('', 5, [ins('x')]), { text: 'x', caret: 1 });
});

test('single-line fields turn newlines and tabs into spaces; control characters are dropped', () => {
  assert.equal(sanitize('one\ntwo\r\nthree\tfour'), 'one two three four');
  assert.equal(sanitize('a\n\n\nb'), 'a b');
  assert.equal(sanitize('a\nb\r\nc', true), 'a\nb\nc');
  assert.equal(sanitize('bell\u0007 nul\u0000'), 'bell nul');
  assert.deepEqual(run('', 0, [ins('line one\nline two')]), { text: 'line one line two', caret: 17 });
});

test('maxLength truncates typing and pasting', () => {
  assert.deepEqual(run('abc', 3, [ins('defg')], { maxLength: 5 }), { text: 'abcde', caret: 5 });
  assert.equal(edit({ text: 'abcde', caret: 5 }, ins('f'), { maxLength: 5 }), null);
  // Truncation doesn't split an emoji's surrogate pair.
  assert.deepEqual(run('abcd', 4, [ins('😀')], { maxLength: 5 }), { text: 'abcd', caret: 4 });
});

test('emoji (surrogate pairs) move and delete as one character', () => {
  assert.deepEqual(run('a😀b', 3, [{ type: 'backspace' }]), { text: 'ab', caret: 1 });
  assert.deepEqual(run('a😀b', 1, [{ type: 'delete' }]), { text: 'ab', caret: 1 });
  assert.deepEqual(run('a😀b', 1, [{ type: 'right' }]), { text: 'a😀b', caret: 3 });
  assert.deepEqual(run('a😀b', 3, [{ type: 'left' }]), { text: 'a😀b', caret: 1 });
  assert.equal(clampCaret('a😀b', 2), 1);
});

test('physical keys map to edits; shortcuts are left alone', () => {
  assert.deepEqual(keyToAction({ key: 'a' }), ins('a'));
  assert.deepEqual(keyToAction({ key: ' ' }), ins(' '));
  assert.deepEqual(keyToAction({ key: 'Backspace' }), { type: 'backspace' });
  assert.deepEqual(keyToAction({ key: 'ArrowLeft' }), { type: 'left' });
  assert.deepEqual(keyToAction({ key: 'ArrowUp' }), { type: 'home' });
  assert.equal(keyToAction({ key: 'Enter' }), 'enter');
  assert.equal(keyToAction({ key: 'Escape' }), 'escape');
  assert.equal(keyToAction({ key: 'v', metaKey: true }), null);
  assert.equal(keyToAction({ key: 'r', ctrlKey: true }), null);
  assert.equal(keyToAction({ key: 'Shift' }), null);
  assert.equal(keyToAction({ key: 'F5' }), null);
  assert.deepEqual(keyToAction({ key: '€', altKey: true }), ins('€'));
});

// troika caretPositions for "abc": each char 10 wide, starting at x = 0.
const positions = [0, 10, 0, 1, 10, 20, 0, 1, 20, 30, 0, 1];

test('caret x comes from troika caret positions', () => {
  assert.equal(caretX(0, positions, 3), 0);
  assert.equal(caretX(2, positions, 3), 20);
  assert.equal(caretX(3, positions, 3), 30);
  assert.equal(caretX(0, null, 0), 0);
});

test('a click puts the caret at the nearest character boundary', () => {
  assert.equal(caretIndexAt(-5, positions, 3), 0);
  assert.equal(caretIndexAt(4, positions, 3), 0);
  assert.equal(caretIndexAt(6, positions, 3), 1);
  assert.equal(caretIndexAt(24, positions, 3), 2);
  assert.equal(caretIndexAt(26, positions, 3), 3);
  assert.equal(caretIndexAt(99, positions, 3), 3);
  assert.equal(caretIndexAt(5, null, 0), 0);
});

test('long text scrolls just enough to keep the caret in view', () => {
  // Fits: no scroll.
  assert.equal(scrollToCaret(30, 0, 100, 30), 0);
  // Caret past the right edge: scroll so it sits at the edge.
  assert.equal(scrollToCaret(150, 0, 100, 150), 50);
  // Caret moved back inside the window: keep the scroll.
  assert.equal(scrollToCaret(120, 50, 100, 150), 50);
  // Caret left of the window: scroll back to it.
  assert.equal(scrollToCaret(20, 50, 100, 150), 20);
  // Text got shorter (deleted at the end): don't leave empty space on the right.
  assert.equal(scrollToCaret(80, 50, 100, 80), 0);
});

test('every keyboard row is the same width', () => {
  for (const [page, rows] of Object.entries(KEYBOARD)) {
    for (const [i, row] of rows.entries()) {
      const units = row.reduce((sum, key) => sum + keyWidth(key), 0);
      assert.equal(units, ROW_UNITS, `${page} row ${i}`);
    }
  }
});

test('the keyboard has QWERTY, backspace, enter, space, done, close and every page', () => {
  const letters = KEYBOARD.letters.map((row) => row.filter((k) => k.action === 'char').map((k) => k.char).join(''));
  assert.deepEqual(letters.slice(0, 3), ['qwertyuiop', 'asdfghjkl', 'zxcvbnm,.?']);
  for (const [page, rows] of Object.entries(KEYBOARD)) {
    const actions = new Set(rows.flat().map((k) => k.action));
    for (const needed of ['backspace', 'enter', 'space', 'done', 'close', 'page']) assert.ok(actions.has(needed), `${page} has ${needed}`);
    const targets = rows.flat().filter((k) => k.action === 'page').map((k) => k.page);
    assert.ok(!targets.includes(page), `${page} doesn't link to itself`);
  }
  // Every digit and printable ASCII symbol is reachable.
  const typeable = new Set(Object.values(KEYBOARD).flat(2).filter((k) => k.action === 'char').map((k) => k.char));
  for (const ch of '0123456789!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~') assert.ok(typeable.has(ch), `can type ${ch}`);
});

test('shift: tap once for one letter, double-tap for caps, tap again for off', () => {
  assert.equal(tapShift('off', 5000), 'once');
  assert.equal(tapShift('once', 200), 'caps');
  assert.equal(tapShift('once', 900), 'off');
  assert.equal(tapShift('caps', 100), 'off');
  assert.equal(afterChar('once'), 'off');
  assert.equal(afterChar('caps'), 'caps');
  assert.equal(afterChar('off'), 'off');
  assert.equal(keyChar({ char: 'q' }, 'off'), 'q');
  assert.equal(keyChar({ char: 'q' }, 'once'), 'Q');
  assert.equal(keyChar({ char: 'q' }, 'caps'), 'Q');
  assert.equal(keyChar({ char: '?' }, 'caps'), '?');
});

test('key labels: shifted letters, enter from the field, page names', () => {
  const q = KEYBOARD.letters[0][0];
  assert.equal(keyLabel(q), 'q');
  assert.equal(keyLabel(q, 'caps'), 'Q');
  const enter = KEYBOARD.letters[1].find((k) => k.action === 'enter');
  assert.equal(keyLabel(enter, 'off', 'send'), 'Send');
  assert.equal(keyLabel(enter, 'off', 'go'), 'Go');
  assert.equal(keyLabel(enter), '↵');
  const shiftKey = KEYBOARD.letters[2][0];
  assert.equal(keyLabel(shiftKey, 'once'), '⇧');
  assert.equal(keyLabel(shiftKey, 'caps'), 'CAPS');
  assert.equal(keyLabel(KEYBOARD.letters[3][0]), '123');
  assert.equal(keyLabel(KEYBOARD.numbers[3][0]), 'ABC');
  assert.equal(startPage('numeric'), 'numbers');
  assert.equal(startPage('text'), 'letters');
});

test('input style: focus and error borders, disabled colors', () => {
  const idle = resolveInputStyle(theme);
  assert.equal(idle.borderColor, theme.colors.input.border);
  assert.equal(resolveInputStyle(theme, { focused: true }).borderColor, theme.colors.input.focus);
  // Error wins over focus, and its message replaces the caption color.
  const error = resolveInputStyle(theme, { focused: true, error: true });
  assert.equal(error.borderColor, theme.colors.input.error);
  assert.equal(error.captionColor, theme.colors.input.errorText);
  const disabled = resolveInputStyle(theme, { disabled: true, focused: true });
  assert.equal(disabled.fill, theme.colors.buttonDisabledFill);
  assert.equal(disabled.text, theme.colors.buttonDisabledText);
  assert.equal(disabled.borderColor, disabled.fill);
});

test('key style: hover and press are distinct, and the enter key is the accent', () => {
  const plain = resolveKeyStyle(theme, { kind: 'char' });
  const hover = resolveKeyStyle(theme, { kind: 'char', hovered: true });
  const pressed = resolveKeyStyle(theme, { kind: 'char', hovered: true, pressed: true });
  assert.notEqual(plain.fill, hover.fill);
  assert.notEqual(hover.fill, pressed.fill);
  assert.equal(pressed.fill, theme.colors.keyboard.pressed);
  assert.equal(resolveKeyStyle(theme, { kind: 'accent' }).fill, theme.colors.keyboard.accent);
  assert.notEqual(resolveKeyStyle(theme, { kind: 'special' }).fill, plain.fill);
  // A latched key (shift / caps) looks on.
  assert.equal(resolveKeyStyle(theme, { kind: 'special', on: true }).fill, theme.colors.keyboard.on);
});

// Design system tokens (@gadxr/ui): theme overrides and the Button style shared by 2D and 3D.
// Imports the TypeScript directly via Node's built-in type stripping.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTheme, defaultTheme, toMeters } from '../src/theme.ts';
import { resolveButtonStyle } from '../src/button-style.ts';

test('createTheme overrides one token and keeps the rest', () => {
  const theme = createTheme({ colors: { button: { primary: { fill: '#123456' } } } });
  assert.equal(theme.colors.button.primary.fill, '#123456');
  assert.equal(theme.colors.button.primary.text, defaultTheme.colors.button.primary.text);
  assert.deepEqual(theme.colors.button.secondary, defaultTheme.colors.button.secondary);
  assert.deepEqual(theme.sizing, defaultTheme.sizing);
  // The default theme itself is untouched.
  assert.notEqual(defaultTheme.colors.button.primary.fill, '#123456');
});

test('a default button is 0.15 m tall in 3D, like the original menu buttons', () => {
  const s = resolveButtonStyle(defaultTheme);
  assert.equal(s.height, 48);
  assert.ok(Math.abs(toMeters(defaultTheme, s.height) - 0.15) < 1e-9);
});

test('each kind resolves its own colors; hover and active differ from rest', () => {
  for (const kind of ['primary', 'secondary', 'tertiary']) {
    const s = resolveButtonStyle(defaultTheme, { kind });
    const c = defaultTheme.colors.button[kind];
    assert.equal(s.fill, c.fill, kind);
    assert.equal(s.text, c.text, kind);
    assert.notEqual(s.hoverFill, s.fill, kind);
    assert.notEqual(s.activeFill, s.fill, kind);
    assert.equal(s.material, defaultTheme.space3d.material[kind], kind);
  }
});

test('glass gets its own 3D label color; 2D keeps the kind color', () => {
  const s = resolveButtonStyle(defaultTheme, { kind: 'primary' });
  assert.equal(s.material, 'glass');
  assert.equal(s.text3d, defaultTheme.space3d.glassText);
  assert.equal(s.text, defaultTheme.colors.button.primary.text);
});

test('selected and disabled are solid in 3D and override the kind', () => {
  const selected = resolveButtonStyle(defaultTheme, { kind: 'primary', selected: true });
  assert.equal(selected.fill, defaultTheme.colors.button.primary.selectedFill);
  assert.equal(selected.material, 'solid');
  assert.equal(selected.text3d, selected.text);

  const disabled = resolveButtonStyle(defaultTheme, { kind: 'primary', selected: true, disabled: true });
  assert.equal(disabled.fill, defaultTheme.colors.buttonDisabledFill);
  assert.equal(disabled.hoverFill, disabled.fill);
  assert.equal(disabled.material, 'solid');
});

test('round, circle and square are square; pill and circle are fully rounded', () => {
  for (const shape of ['round', 'circle', 'square']) {
    const s = resolveButtonStyle(defaultTheme, { shape });
    assert.equal(s.square, true, shape);
    assert.equal(s.paddingX, 0, shape);
  }
  assert.equal(resolveButtonStyle(defaultTheme, { shape: 'default' }).square, false);
  assert.equal(resolveButtonStyle(defaultTheme, { shape: 'pill' }).radius, 24);
  assert.equal(resolveButtonStyle(defaultTheme, { shape: 'circle', size: 'mini' }).radius, 14);
  assert.equal(resolveButtonStyle(defaultTheme, { shape: 'default' }).radius, defaultTheme.borders.buttonBorderRadius);
});

test('sizes grow from mini to large', () => {
  const heights = ['mini', 'compact', 'default', 'large'].map((size) => resolveButtonStyle(defaultTheme, { size }).height);
  assert.deepEqual(heights, [...heights].sort((a, b) => a - b));
  assert.equal(new Set(heights).size, 4);
});

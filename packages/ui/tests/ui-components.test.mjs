// Checkbox / Slider / Tag tokens and value math (src/component-style.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultTheme as theme } from '../src/theme.ts';
import { resolveCheckboxStyle, resolveTagStyle, sliderFraction, sliderValueAt } from '../src/component-style.ts';

test('slider value snaps to the step and stays in range', () => {
  assert.equal(sliderValueAt(0.5, 0, 100, 1), 50);
  assert.equal(sliderValueAt(0.333, 0, 100, 10), 30);
  assert.equal(sliderValueAt(-0.2, 0, 100, 1), 0);
  assert.equal(sliderValueAt(1.4, 0, 100, 1), 100);
  // A step that doesn't divide the range never overshoots max.
  assert.equal(sliderValueAt(1, 0, 10, 3), 9);
  assert.equal(sliderValueAt(0.99, 0, 10, 3), 9);
});

test('fractional steps come out clean', () => {
  assert.equal(sliderValueAt(0.3, 0, 1, 0.1), 0.3);
  assert.equal(sliderValueAt(0.7, 0, 1, 0.1), 0.7);
  assert.equal(sliderValueAt(0.123, -1, 1, 0.05), -0.75);
});

test('slider fraction is the inverse, clamped', () => {
  assert.equal(sliderFraction(25, 0, 100), 0.25);
  assert.equal(sliderFraction(-5, 0, 100), 0);
  assert.equal(sliderFraction(500, 0, 100), 1);
  assert.equal(sliderFraction(3, 3, 3), 0, 'empty range');
  for (const v of [0, 10, 37, 100]) assert.equal(sliderValueAt(sliderFraction(v, 0, 100), 0, 100, 1), v);
});

test('checkbox: unchecked is outlined in 2D but a solid slab in 3D; checked fills', () => {
  const off = resolveCheckboxStyle(theme);
  assert.equal(off.fill, 'transparent');
  assert.equal(off.fill3d, theme.colors.checkbox.fill3d);
  assert.equal(off.border, theme.colors.checkbox.border);
  const on = resolveCheckboxStyle(theme, { checked: true });
  assert.equal(on.fill, theme.colors.checkbox.fillChecked);
  assert.equal(on.fill3d, on.fill);
  assert.equal(on.width, on.height);
});

test('toggle is a pill track that changes color when checked', () => {
  const off = resolveCheckboxStyle(theme, { type: 'toggle' });
  const on = resolveCheckboxStyle(theme, { type: 'toggle', checked: true });
  assert.ok(off.width > off.height);
  assert.equal(off.radius, off.height / 2);
  assert.notEqual(off.fill, on.fill);
  assert.ok(on.knob < on.height, 'knob fits inside the track');
});

test('disabled checkbox uses the disabled tokens', () => {
  const s = resolveCheckboxStyle(theme, { type: 'toggle', checked: true, disabled: true });
  assert.equal(s.fill, theme.colors.buttonDisabledFill);
  assert.equal(s.labelColor, theme.colors.buttonDisabledText);
});

test('tag kinds and variants map to their colors', () => {
  for (const kind of Object.keys(theme.colors.tag)) {
    const solid = resolveTagStyle(theme, { kind, variant: 'solid' });
    const light = resolveTagStyle(theme, { kind, variant: 'light' });
    assert.equal(solid.fill, theme.colors.tag[kind].solidFill, kind);
    assert.equal(light.text, theme.colors.tag[kind].lightText, kind);
    assert.notEqual(solid.fill, light.fill, kind);
  }
  assert.ok(resolveTagStyle(theme, { size: 'medium' }).height > resolveTagStyle(theme, { size: 'small' }).height);
});

test('keyboard navigation skips unusable entries and wraps', async () => {
  const { nextIndex } = await import('../src/component-style.ts');
  // Menu: Thumbs up, Wave, Rock on, ─divider─, Dance (disabled), Clear emote
  const usable = [true, true, true, false, false, true];
  assert.equal(nextIndex(usable, 2, 1), 5, 'down skips divider and disabled');
  assert.equal(nextIndex(usable, 5, 1), 0, 'wraps to the top');
  assert.equal(nextIndex(usable, 0, -1), 5, 'wraps to the bottom');
  assert.equal(nextIndex(usable, -1, 1, false), 0, 'Home');
  assert.equal(nextIndex(usable, usable.length, -1, false), 5, 'End');
  assert.equal(nextIndex(usable, 5, 1, false), 5, 'no wrap stays put');
  assert.equal(nextIndex([false, false], 0, 1), 0, 'nothing usable');
});

test('avatar initials: first and last word, whole characters', async () => {
  const { initials } = await import('../src/component-style.ts');
  assert.equal(initials('Ada Lovelace'), 'AL');
  assert.equal(initials('  rhys  '), 'R');
  assert.equal(initials('Grace Brewster Murray Hopper'), 'GH');
  assert.equal(initials('élan vital'), 'ÉV');
  assert.equal(initials('🦊 Fox'), '🦊F', 'an emoji stays whole');
  assert.equal(initials(''), '');
});

test('avatar color is stable per name and comes from the palette', async () => {
  const { avatarColor } = await import('../src/component-style.ts');
  const palette = theme.colors.avatar.palette;
  const a = avatarColor('Ada Lovelace', palette);
  assert.ok(palette.includes(a));
  assert.equal(avatarColor('ada lovelace ', palette), a, 'case and spacing don\'t matter');
  const used = new Set(['Ada', 'Grace', 'Linus', 'Margaret', 'Rhys', 'Tim', 'Alan', 'Barbara'].map((n) => avatarColor(n, palette)));
  assert.ok(used.size >= 3, `names spread over the palette (${used.size} colors)`);
});

test('tooltip sits gap-clear of the trigger on its placement side', async () => {
  const { tooltipOffset } = await import('../src/component-style.ts');
  const trigger = { width: 0.4, height: 0.15 };
  const bubble = { width: 0.3, height: 0.1 };
  assert.deepEqual(tooltipOffset('top', trigger, bubble, 0.02), { x: 0, y: 0.075 + 0.02 + 0.05 });
  assert.deepEqual(tooltipOffset('bottom', trigger, bubble, 0.02), { x: 0, y: -(0.075 + 0.02 + 0.05) });
  assert.deepEqual(tooltipOffset('left', trigger, bubble, 0.02), { x: -(0.2 + 0.02 + 0.15), y: 0 });
  assert.deepEqual(tooltipOffset('right', trigger, bubble, 0.02), { x: 0.2 + 0.02 + 0.15, y: 0 });
});

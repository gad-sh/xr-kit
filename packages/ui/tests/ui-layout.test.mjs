// 3D stack layout (src/layout-math.ts): rows and columns centered on the origin.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stackLayout } from '../src/layout-math.ts';

const close = (a, b) => Math.abs(a - b) < 1e-9;

test('a row lays items left to right with gaps, centered', () => {
  const l = stackLayout([{ width: 0.4, height: 0.15 }, { width: 0.55, height: 0.15 }, { width: 0.3, height: 0.15 }], { direction: 'row', gap: 0.2 });
  assert.ok(close(l.width, 1.65));
  assert.ok(close(l.height, 0.15));
  assert.deepEqual(l.offsets.map((o) => +o.x.toFixed(3)), [-0.625, 0.05, 0.675]);
  assert.ok(l.offsets.every((o) => o.y === 0 || Object.is(o.y, -0)));
  // Gap between neighbours' edges is exactly `gap`.
  assert.ok(close((l.offsets[1].x - 0.55 / 2) - (l.offsets[0].x + 0.4 / 2), 0.2));
});

test('a column runs top to bottom; align start lines up left edges', () => {
  const sizes = [{ width: 1, height: 0.1 }, { width: 0.5, height: 0.2 }];
  const l = stackLayout(sizes, { direction: 'column', gap: 0.1, align: 'start' });
  assert.ok(close(l.width, 1));
  assert.ok(close(l.height, 0.4));
  assert.ok(close(l.offsets[0].y, 0.15));
  assert.ok(close(l.offsets[1].y, -0.1));
  assert.ok(l.offsets[0].y > l.offsets[1].y, 'first item is on top');
  // Left edges both at -width/2.
  assert.ok(close(l.offsets[0].x - 0.5, -0.5));
  assert.ok(close(l.offsets[1].x - 0.25, -0.5));
});

test('center alignment keeps items on the axis', () => {
  const l = stackLayout([{ width: 1, height: 0.1 }, { width: 0.5, height: 0.2 }], { direction: 'column', gap: 0 });
  assert.deepEqual(l.offsets.map((o) => o.x), [0, 0]);
});

test('row align start lines up top edges', () => {
  const l = stackLayout([{ width: 0.2, height: 0.4 }, { width: 0.2, height: 0.1 }], { direction: 'row', gap: 0, align: 'start' });
  assert.ok(close(l.offsets[0].y + 0.2, 0.2));
  assert.ok(close(l.offsets[1].y + 0.05, 0.2));
});

test('empty stack has no size', () => {
  assert.deepEqual(stackLayout([], { direction: 'row', gap: 0.1 }), { width: 0, height: 0, offsets: [] });
});

test("align 'end' lines up right edges; an item can override the stack's alignment", () => {
  const l = stackLayout(
    [{ width: 1, height: 0.1 }, { width: 0.4, height: 0.1, align: 'end' }, { width: 0.4, height: 0.1 }],
    { direction: 'column', gap: 0, align: 'start' }
  );
  // Item 1 (end): right edge at +width/2; item 2 follows the stack (start): left edge at -width/2.
  assert.ok(close(l.offsets[1].x + 0.2, 0.5));
  assert.ok(close(l.offsets[2].x - 0.2, -0.5));
  const row = stackLayout([{ width: 0.2, height: 0.4 }, { width: 0.2, height: 0.1 }], { direction: 'row', gap: 0, align: 'end' });
  assert.ok(close(row.offsets[1].y - 0.05, -0.2), 'bottom edges line up in a row');
});

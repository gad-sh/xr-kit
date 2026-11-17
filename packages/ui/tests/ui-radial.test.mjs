// Radial menu (src/radial-math.ts). The input cases are ported from the old
// emote picker (public/aframe-components/emotepicker.js) tests, so the world's
// trigger + thumbstick behaviour stays the same.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadThree } from './helpers.mjs';
import { ON_CONTROLLER, polar, RadialInput, sectorPath, wedgeAt, wedgeCenter } from '../src/radial-math.ts';

// The world's picker: 5 wedges, wedge 0 starting at +x.
const five = { count: 5, startAngle: 0 };
// Stick axes as A-Frame reports them: forward is -y, so flip y like the component does.
const stick = (input, x, y, offset = 0) => input.aim(x, -y, offset);

test('stick direction maps to wedges counterclockwise from the right', () => {
  const input = new RadialInput(five);
  input.start();
  const cases = [['right', 1, 0, 0], ['forward', 0, -1, 1], ['left', -1, 0, 2], ['back-left', -0.5, 0.85, 3], ['back-right', 0.5, 0.85, 4]];
  for (const [name, x, y, wedge] of cases) {
    stick(input, x, y);
    assert.equal(input.selected, wedge, `${name} should pick wedge ${wedge}`);
  }
});

test('angleOffset rotates which wedge the stick points at (the world uses 72°)', () => {
  const input = new RadialInput(five);
  input.start();
  stick(input, 1, 0, 72); // straight right now lands one wedge clockwise
  assert.equal(input.selected, 4);
  stick(input, 0, -1, 72);
  assert.equal(input.selected, 0);
});

test('stick ignored before opening; small nudges and recentring keep the last wedge', () => {
  const input = new RadialInput(five);
  stick(input, 1, 0);
  assert.equal(input.selected, -1, 'no highlight while closed');
  input.start();
  stick(input, 0, -1);
  stick(input, 0.1, 0);
  stick(input, 0, 0);
  assert.equal(input.selected, 1);
});

test('release returns the wedge, or -1 if none was picked, and clears it', () => {
  const input = new RadialInput(five);
  input.start();
  assert.equal(input.release(), -1);
  input.start();
  stick(input, -1, 0);
  assert.equal(input.release(), 2);
  assert.equal(input.selected, -1, 'highlight cleared after release');
  assert.equal(input.open, false);
  assert.equal(input.release(), -1, 'releasing again picks nothing');
});

test('disabled wedges cannot be picked by aiming or pointing', () => {
  const input = new RadialInput(five, 0.5, (i) => i === 2);
  input.start();
  stick(input, -1, 0);
  assert.equal(input.selected, -1);
  input.point(2);
  assert.equal(input.selected, -1);
  input.point(3);
  assert.equal(input.release(), 3);
});

test('wedge centres and a top-centred layout', () => {
  assert.equal(wedgeCenter(0, five), 36);
  // Four wedges with the first centred at the top: start at 90 - 45.
  const top = { count: 4, startAngle: 45 };
  assert.equal(wedgeAt(0, 1, top), 0, 'up is the first');
  assert.equal(wedgeAt(-1, 0, top), 1, 'then counterclockwise: left');
  assert.equal(wedgeAt(0, 0.1, top, 0.5), -1, 'inside the deadzone');
});

test('sector paths close and use the right arc direction', () => {
  const d = sectorPath(0, { count: 4, startAngle: 0 }, 20, 100, 4);
  assert.match(d, /^M .* A 100 100 0 0 0 .* L .* A 20 20 0 0 1 .* Z$/);
});

// The left-hand placement is only tuned on the right; check it's that setup's mirror image
// in the controller's space (x flipped): the same stick push, mirrored, lands on a wedge
// in the mirrored spot, and the labels still read upright (not back to front).
test('left-hand controller placement mirrors the right', async () => {
  const THREE = await loadThree();
  const deg = THREE.MathUtils.degToRad;
  // Like A-Frame's position/rotation components (rotation order YXZ).
  const ring = (p) => {
    const [px, py, pz] = p.position.split(' ').map(Number);
    const [rx, ry, rz] = p.rotation.split(' ').map(Number);
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(px, py, pz),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(deg(rx), deg(ry), deg(rz), 'YXZ')),
      new THREE.Vector3(1, 1, 1)
    );
    return { p, m, q: new THREE.Quaternion().setFromRotationMatrix(m) };
  };
  const mirror = (v) => new THREE.Vector3(-v.x, v.y, v.z);
  const near = (a, b, what) => assert.ok(a.distanceTo(b) < 1e-6, `${what}: ${a.toArray()} vs ${b.toArray()}`);
  // Where the stick's wedge is drawn, and that wedge's label up / facing directions.
  const pick = ({ p, m, q }, x, y) => {
    const layout = { count: 5, startAngle: p.startAngle };
    const input = new RadialInput(layout);
    input.start();
    stick(input, x, y, p.angleOffset);
    const i = input.selected;
    const [lx, ly] = polar((p.radius + p.innerRadius) / 2 * 0.003125, wedgeCenter(i, layout));
    const labelQ = q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, deg(p.labelRotation))));
    return {
      item: i,
      at: new THREE.Vector3(lx, ly, 0).applyMatrix4(m),
      up: new THREE.Vector3(0, 1, 0).applyQuaternion(labelQ),
      facing: new THREE.Vector3(0, 0, 1).applyQuaternion(labelQ),
    };
  };
  const right = ring(ON_CONTROLLER.right);
  const left = ring(ON_CONTROLLER.left);
  // (Every 15°, offset from the wedge edges.)
  for (let a = 7; a < 360; a += 15) {
    const x = Math.cos(deg(a)), y = Math.sin(deg(a));
    const r = pick(right, x, y);
    const l = pick(left, -x, y);
    near(l.at, mirror(r.at), `stick at ${a}°: wedge position`);
    near(l.up, mirror(r.up), `stick at ${a}°: label up`);
    near(l.facing, mirror(r.facing), `stick at ${a}°: label facing`);
    assert.equal(l.item, (5 - r.item) % 5, 'the wedges run the other way round from the same wedge 0');
  }
});

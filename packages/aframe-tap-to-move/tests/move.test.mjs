// tap-to-move's decisions (src/move.js): tap or drag, where a ray lands, where the rig goes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadThree } from '../../ui/tests/helpers.mjs';
import { TAP_SLOP_PX, findLanding, isTap, rigTarget, screenPoint, smoothstep } from '../src/move.js';

const THREE = await loadThree();
const v = (x, y, z) => new THREE.Vector3(x, y, z);
const forward = v(0, 0, -1);

test('a press is a tap while the pointer stays within the slop on screen', () => {
  const down = { screen: { x: 100, y: 100 }, direction: forward };
  assert.ok(isTap(down, { screen: { x: 106, y: 108 }, direction: v(1, 0, 0) }), 'screen distance decides, not the ray');
  assert.ok(!isTap(down, { screen: { x: 100 + TAP_SLOP_PX + 1, y: 100 }, direction: forward }), 'a drag to look around');
});

test('without a screen position (a laser, an AR tap) the ray may turn a few degrees', () => {
  const down = { screen: null, direction: forward };
  const turned = (deg) => forward.clone().applyAxisAngle(v(0, 1, 0), (deg * Math.PI) / 180);
  assert.ok(isTap(down, { screen: null, direction: turned(3) }));
  assert.ok(!isTap(down, { screen: null, direction: turned(8) }));
  assert.ok(isTap(down, { screen: { x: 0, y: 0 }, direction: turned(3) }), 'a screen position on one side only');
});

test('screenPoint reads the newest DOM event, if it is of this phase (the cursor keeps stale ones)', () => {
  const touchstart = { type: 'touchstart', timeStamp: 1, touches: [{ clientX: 5, clientY: 6 }] };
  const touchend = { type: 'touchend', timeStamp: 2, touches: [], changedTouches: [{ clientX: 7, clientY: 8 }] };
  assert.deepEqual(screenPoint({ touchEvent: touchstart }, 'down'), { x: 5, y: 6 });
  assert.deepEqual(screenPoint({ touchEvent: touchend }, 'up'), { x: 7, y: 8 }, 'the lifted finger');
  // A mouse click after a tap: the touchend is still there, older.
  const mousedown = { type: 'mousedown', timeStamp: 3, clientX: 1, clientY: 2 };
  const mouseup = { type: 'mouseup', timeStamp: 4, clientX: 1, clientY: 2 };
  assert.deepEqual(screenPoint({ mouseEvent: mousedown, touchEvent: touchend }, 'down'), { x: 1, y: 2 });
  assert.deepEqual(screenPoint({ mouseEvent: mouseup, touchEvent: touchend }, 'up'), { x: 1, y: 2 });
  // And a tap after a click.
  const later = { type: 'touchend', timeStamp: 5, touches: [], changedTouches: [{ clientX: 9, clientY: 9 }] };
  assert.deepEqual(screenPoint({ mouseEvent: mouseup, touchEvent: later }, 'up'), { x: 9, y: 9 });
  assert.equal(screenPoint({ mouseEvent: mousedown }, 'up'), null, "a laser's mouseup after a mouse click");
  assert.equal(screenPoint({}, 'down'), null, 'a laser: no DOM event');
});

// A scene: a floor plane (rotated flat, as <a-plane rotation="-90 0 0">), a box on it (its top
// and sides), and a wall in front.
function world() {
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20));
  floor.rotation.x = -Math.PI / 2;
  const box = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 2));
  box.position.set(0, 0.5, -5);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(2, 3));
  wall.position.set(5, 1.5, -3);
  for (const mesh of [floor, box, wall]) mesh.updateMatrixWorld();
  const floors = new Set([floor, box]);
  return { floor, box, wall, meshes: [floor, box, wall], isFloor: (o) => floors.has(o) };
}

const cast = (origin, toward) => {
  const raycaster = new THREE.Raycaster();
  raycaster.set(origin, toward.clone().sub(origin).normalize());
  return raycaster;
};

test('findLanding: the floor where the ray meets it', () => {
  const { meshes, isFloor } = world();
  const point = findLanding(THREE, cast(v(0, 1.6, 0), v(-2, 0, -2)), meshes, isFloor, 45);
  assert.ok(point);
  assert.ok(point.distanceTo(v(-2, 0, -2)) < 1e-6);
});

test("findLanding: a box's top is floor, its side too steep, and nothing at all is a miss", () => {
  const { meshes, isFloor } = world();
  const top = findLanding(THREE, cast(v(0, 3, 0), v(0, 1, -5)), meshes, isFloor, 45);
  assert.ok(top && Math.abs(top.y - 1) < 1e-6);
  assert.equal(findLanding(THREE, cast(v(0, 0.5, 0), v(0, 0.5, -5)), meshes, isFloor, 45), null, 'the side');
  assert.equal(findLanding(THREE, cast(v(0, 1.6, 0), v(0, 5, -5)), meshes, isFloor, 45), null, 'the sky');
});

test('findLanding: something else in front of the floor blocks it', () => {
  const { meshes, isFloor } = world();
  // The wall stands between the camera and the floor behind it.
  assert.equal(findLanding(THREE, cast(v(5, 1.6, 0), v(5, 0, -6)), meshes, isFloor, 45), null);
  assert.ok(findLanding(THREE, cast(v(5, 1.6, 0), v(5, 0, -2)), meshes, isFloor, 45), 'short of the wall');
});

test('rigTarget puts the camera over the point, keeping its offset in the rig, at the floor height', () => {
  // Rig at (1, 0, 1); the camera (a headset walked half a meter off-center) at (1.5, 1.6, 1).
  assert.deepEqual(rigTarget({ x: 1, y: 0, z: 1 }, { x: 1.5, y: 1.6, z: 1 }, { x: 4, y: 0.8, z: -2 }), { x: 3.5, y: 0.8, z: -2 });
});

test('smoothstep eases from 0 to 1', () => {
  assert.equal(smoothstep(0), 0);
  assert.equal(smoothstep(0.5), 0.5);
  assert.equal(smoothstep(1), 1);
  assert.ok(smoothstep(0.1) < 0.1);
});

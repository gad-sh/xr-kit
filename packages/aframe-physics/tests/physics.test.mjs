// world.js (crashcat, with cast-fix.js): boxes and balls on a terrain-like mesh, placed with a
// rotation like a real terrain's.
import test from 'node:test';
import assert from 'node:assert/strict';
import { collisionDispatch, ShapeType } from 'crashcat';
import { loadThree } from '../../ui/tests/helpers.mjs';
import { addBody, createPhysicsWorld, getBody, removeBody, step } from '../src/world.js';

const THREE = await loadThree();

// A plane built in XY, with heights in z (flat, or bumpy), rotated to lie flat and turned 45°.
function terrain({ flat = false } = {}) {
  const geometry = new THREE.PlaneGeometry(2600, 2600, 64, 64);
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setZ(i, flat ? 200 : 200 + 20 * Math.sin(pos.getX(i) / 150) * Math.cos(pos.getY(i) / 150));
  const mesh = new THREE.Mesh(geometry);
  mesh.rotation.set(-Math.PI / 2, 0, Math.PI / 4);
  mesh.updateMatrixWorld(true);
  return mesh;
}

// The terrain's height under (x, z), by three.js's own raycast.
function groundAt(mesh, x, z) {
  return new THREE.Raycaster(new THREE.Vector3(x, 1000, z), new THREE.Vector3(0, -1, 0)).intersectObject(mesh)[0].point.y;
}

function place(geometry, x, y, z) {
  const mesh = new THREE.Mesh(geometry);
  mesh.position.set(x, y, z);
  mesh.updateMatrixWorld(true);
  return mesh;
}

// Drops a ball (or a small box) at `speed` m/s onto the terrain; returns its lowest and last
// heights above the ground under it (it rolls downhill).
function drop({ flat = false, shape = 'sphere', speed = 30, steps = 72 * 2 } = {}) {
  const p = createPhysicsWorld();
  const ground = terrain({ flat });
  addBody(p, 'static', ground);
  const floor = groundAt(ground, 10, 10);
  const geometry = shape === 'sphere' ? new THREE.SphereGeometry(0.06) : new THREE.BoxGeometry(0.12, 0.12, 0.12);
  const id = addBody(p, 'dynamic', place(geometry, 10, floor + 1, 10), shape, [0, -speed, 0]).id;
  const above = () => {
    const [x, y, z] = getBody(p, id).position;
    return y - groundAt(ground, x, z);
  };
  let lowest = Infinity;
  for (let i = 0; i < steps; i++) {
    step(p, 1 / 72);
    lowest = Math.min(lowest, above());
  }
  return { lowest, last: above() };
}

test('a dynamic box falls and comes to rest on a static terrain', () => {
  const p = createPhysicsWorld();
  const ground = terrain();
  addBody(p, 'static', ground);
  const id = addBody(p, 'dynamic', place(new THREE.BoxGeometry(1, 1, 1), -100, 260, -5)).id;
  for (let i = 0; i < 60 * 8; i++) step(p, 1 / 60);
  const [x, y, z] = getBody(p, id).position;
  const floor = groundAt(ground, x, z);
  // A unit cube resting on a gentle slope: its centre ~0.5 m (up to ~0.87 m, on an edge) above the ground.
  assert.ok(y > floor + 0.3 && y < floor + 1, `box at ${y.toFixed(2)}, ground at ${floor.toFixed(2)}`);
});

test('big steps are capped so a box does not fall through', () => {
  const p = createPhysicsWorld();
  const ground = terrain();
  addBody(p, 'static', ground);
  const id = addBody(p, 'dynamic', place(new THREE.BoxGeometry(1, 1, 1), 0, 300, 0)).id;
  for (let i = 0; i < 40; i++) step(p, 1); // a background tab: 1 s frames
  const [x, y, z] = getBody(p, id).position;
  assert.ok(y > groundAt(ground, x, z), 'above the ground');
});

test('a thrown ball keeps its velocity and lands on the terrain', () => {
  const p = createPhysicsWorld();
  const ground = terrain();
  addBody(p, 'static', ground);
  const id = addBody(p, 'dynamic', place(new THREE.SphereGeometry(0.06), 0, groundAt(ground, 0, 0) + 1.5, 0), 'sphere', [8, 3, 0]).id;
  step(p, 1 / 72);
  assert.ok(getBody(p, id).position[0] > 0.1, 'moves along its velocity');
  for (let i = 0; i < 72 * 6; i++) step(p, 1 / 72);
  const [x, y, z] = getBody(p, id).position;
  assert.ok(x > 3, `went forward (x ${x.toFixed(2)})`);
  const floor = groundAt(ground, x, z);
  assert.ok(y > floor && y < floor + 0.5, `ball at ${y.toFixed(2)}, ground at ${floor.toFixed(2)}`);
});

for (const flat of [true, false]) for (const shape of ['sphere', 'box']) for (const speed of [10, 30, 60]) {
  test(`a ${shape} at ${speed} m/s stops at a ${flat ? 'flat' : 'bumpy'} terrain mesh`, () => {
    const { lowest } = drop({ flat, shape, speed });
    // Its centre stays about its half size (0.06 m) above the surface, give or take crashcat's slop.
    assert.ok(lowest > 0.03, `got to ${lowest.toFixed(2)} m above the ground`);
  });
}

test('a ball rolling on a flat floor comes to rest', () => {
  const p = createPhysicsWorld();
  const ground = terrain({ flat: true });
  addBody(p, 'static', ground);
  const id = addBody(p, 'dynamic', place(new THREE.SphereGeometry(0.06), 0, 200.06, 0), 'sphere', [3, 0, 0]).id;
  for (let i = 0; i < 72 * 10; i++) step(p, 1 / 72);
  const body = getBody(p, id);
  assert.ok(Math.hypot(...body.motionProperties.linearVelocity) < 0.05, 'stopped');
  assert.ok(body.position[0] < 6, `rolled ${body.position[0].toFixed(2)} m`);
});

test('a ball bounces off the terrain', () => {
  assert.ok(drop({ flat: true, speed: 30, steps: 36 }).last > 1, 'back up');
});

for (const [shape, type] of [['sphere', ShapeType.SPHERE], ['box', ShapeType.BOX]]) {
  test(`crashcat still reverses ${shape} vs triangle mesh casts (when this fails, drop cast-fix.js)`, () => {
    const fns = collisionDispatch.castFns.get(type);
    const fixed = fns.get(ShapeType.TRIANGLE_MESH);
    fns.set(ShapeType.TRIANGLE_MESH, fixed.original);
    try {
      assert.ok(drop({ flat: true, shape, speed: 30, steps: 10 }).lowest < -0.5, 'without the fix, it goes through');
    } finally {
      fns.set(ShapeType.TRIANGLE_MESH, fixed);
    }
  });
}

test('a removed body is gone', () => {
  const p = createPhysicsWorld();
  const id = addBody(p, 'dynamic', place(new THREE.BoxGeometry(1, 1, 1), 0, 10, 0)).id;
  removeBody(p, id);
  assert.equal(getBody(p, id), undefined);
});

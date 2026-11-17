// Surface placement (src/aframe/placement.ts): lazy follow and attach.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadThree, instantiate } from './helpers.mjs';
import { angleDelta, followGoal, needsRecentre, placementComponents, surfacePlacement } from '../src/aframe/placement.ts';

const THREE = await loadThree();
const { follow, attach } = placementComponents(THREE);
const close = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;
const deg = (d) => (d * Math.PI) / 180;

test('the follow goal is in front of the head, level, and to the side', () => {
  const g = followGoal({ x: 0, y: 1.6, z: 0, yaw: 0 }, { distance: 1, height: -0.2, side: 0.5 });
  assert.ok(close(g.x, 0.5) && close(g.y, 1.4) && close(g.z, -1));
  // Turned 90° left (yaw +90°): forward is -x, right is -z.
  const t = followGoal({ x: 0, y: 1.6, z: 0, yaw: deg(90) }, { distance: 1, height: 0, side: 0.5 });
  assert.ok(close(t.x, -1) && close(t.z, -0.5), JSON.stringify(t));
});

test('angleDelta takes the short way round', () => {
  assert.ok(close(angleDelta(deg(170), deg(-170)), deg(20)));
  assert.ok(close(angleDelta(deg(-170), deg(170)), deg(-20)));
});

test('small head turns leave the panel alone; big ones move it', () => {
  const opts = { distance: 1.2, height: -0.2, side: 0 };
  const start = followGoal({ x: 0, y: 1.6, z: 0, yaw: 0 }, opts);
  const look = (yaw) => {
    const head = { x: 0, y: 1.6, z: 0, yaw: deg(yaw) };
    return needsRecentre(start, head, followGoal(head, opts), 30);
  };
  assert.equal(look(10), false);
  assert.equal(look(-25), false);
  assert.equal(look(45), true);
  // Stepping a meter back also triggers it (too far), as does standing up.
  const back = { x: 0, y: 1.6, z: 1, yaw: 0 };
  assert.equal(needsRecentre(start, back, followGoal(back, opts), 30), true);
  const up = { x: 0, y: 2.1, z: 0, yaw: 0 };
  assert.equal(needsRecentre(start, up, followGoal(up, opts), 30), true);
});

function rig() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  camera.position.set(0, 1.6, 0);
  scene.add(camera);
  const obj = new THREE.Object3D();
  scene.add(obj);
  const sceneEl = { camera, addEventListener() {}, removeEventListener() {} };
  return { scene, camera, obj, el: { object3D: obj, sceneEl } };
}

test('ui-follow snaps in front, ignores a glance, then eases back after a big turn', () => {
  const { camera, obj, el } = rig();
  const c = instantiate(follow, el, { distance: 1, height: -0.2, side: 0, maxAngle: 30, smoothing: 100 });
  c.init();
  c.tick(0, 16);
  assert.ok(close(obj.position.z, -1) && close(obj.position.y, 1.4), 'snapped in front');

  camera.rotation.y = deg(20);
  camera.updateMatrixWorld();
  for (let i = 0; i < 30; i++) c.tick(0, 16);
  assert.ok(close(obj.position.z, -1), 'a 20° glance does not move it');

  camera.rotation.y = deg(90);
  camera.updateMatrixWorld();
  c.tick(0, 16);
  assert.ok(obj.position.x < 0 && obj.position.x > -1, 'starts moving, but not in one jump');
  for (let i = 0; i < 120; i++) c.tick(0, 16);
  assert.ok(close(obj.position.x, -1, 0.01) && close(obj.position.z, 0, 0.01), 'arrives in front again');
  const yaw = new THREE.Euler().setFromQuaternion(obj.quaternion, 'YXZ').y;
  assert.ok(close(yaw, deg(90), 0.02), 'faces the head');
  assert.equal(c.moving, false);
});

test('ui-attach follows its target with an offset, under a moved parent', () => {
  const scene = new THREE.Scene();
  const hand = new THREE.Object3D();
  hand.position.set(1, 1, 0);
  hand.rotation.y = deg(90);
  scene.add(hand);
  const parent = new THREE.Object3D();
  parent.position.set(5, 0, 0);
  scene.add(parent);
  const obj = new THREE.Object3D();
  parent.add(obj);
  const c = instantiate(attach, { object3D: obj }, { target: { object3D: hand }, position: { x: 0, y: 0.1, z: -0.2 }, rotation: { x: 0, y: 0, z: 0 } });
  c.init();
  c.update();
  c.tick();
  const world = obj.getWorldPosition(new THREE.Vector3());
  // -0.2 along the hand's local z, which faces -x after the 90° turn → x = 1 - 0.2.
  assert.ok(close(world.x, 0.8, 1e-6) && close(world.y, 1.1, 1e-6) && close(world.z, 0, 1e-6), JSON.stringify(world));
});

test('surfacePlacement: desktop placement until immersive, then the VR one', () => {
  const desk = { immersive: false, presenting: false };
  const sim = { immersive: true, presenting: false };
  const vr = { immersive: true, presenting: true };
  assert.equal(surfacePlacement({ vr: 'follow', desktop: 'screen' }, desk), 'screen');
  assert.equal(surfacePlacement({ vr: 'follow', desktop: 'camera' }, desk), 'camera');
  assert.equal(surfacePlacement({ vr: 'follow', desktop: 'camera' }, vr), 'follow');
  assert.equal(surfacePlacement({ vr: 'world', desktop: 'camera' }, sim), 'world');
  // No controllers when only simulating, so hand surfaces follow instead.
  assert.equal(surfacePlacement({ vr: 'hand', desktop: 'screen' }, sim), 'follow');
  assert.equal(surfacePlacement({ vr: 'hand', desktop: 'screen' }, vr), 'hand');
});

// The desktop menu rides on the camera inside the player rig. When the rig moves this frame
// (movement-controls, navmesh), its matrixWorld is stale until render; attach must still
// use the rig's new position, or the menu trails a frame behind and jitters while walking.
test('ui-attach uses this frame\'s pose when the target\'s parent has just moved', () => {
  const scene = new THREE.Scene();
  const rig = new THREE.Object3D();
  const camera = new THREE.Object3D();
  camera.position.set(0, 1.6, 0);
  rig.add(camera);
  scene.add(rig);
  const obj = new THREE.Object3D();
  scene.add(obj);
  scene.updateMatrixWorld(true); // last frame's render
  const c = instantiate(attach, { object3D: obj }, { target: { object3D: camera }, position: { x: 0, y: -0.5, z: -1 }, rotation: { x: 0, y: 0, z: 0 } });
  c.init();
  c.update();
  rig.position.set(3, 0.2, 0); // the player walks this frame, before attach ticks
  c.tick();
  const world = obj.getWorldPosition(new THREE.Vector3());
  assert.ok(close(world.x, 3, 1e-6) && close(world.y, 1.3, 1e-6) && close(world.z, -1, 1e-6), JSON.stringify(world));
});

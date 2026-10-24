// The physics world (crashcat) and the bodies made from three.js meshes, without A-Frame (index.js
// is the A-Frame side), so tests can run it in Node.
import {
  addBroadphaseLayer, addObjectLayer, box, createWorld, createWorldSettings, enableCollision,
  MotionQuality, MotionType, registerAll, rigidBody, sphere, triangleMesh, updateWorld,
} from 'crashcat';
import { fixTriangleMeshCasts } from './cast-fix.js';

registerAll();
fixTriangleMeshCasts();

/** @typedef {{ world: import('crashcat').World, moving: number, still: number }} PhysicsWorld */

/** @returns {PhysicsWorld} */
export function createPhysicsWorld(gravity = -9.81) {
  const settings = createWorldSettings();
  settings.gravity = [0, gravity, 0];
  const moving = addObjectLayer(settings, addBroadphaseLayer(settings));
  const still = addObjectLayer(settings, addBroadphaseLayer(settings));
  enableCollision(settings, moving, still);
  enableCollision(settings, moving, moving);
  return { world: createWorld(settings), moving, still };
}

// Big steps (a slow frame, a tab in the background) would let bodies fall through what's below.
export const MAX_STEP = 1 / 30;

export function step(p, dt) {
  updateWorld(p.world, undefined, Math.min(dt, MAX_STEP));
}

// Vectors and quaternions of the mesh's own three.js (A-Frame's, or the tests'): this file
// doesn't import three, which a page with script-tag A-Frame only has as a global.
const vec3 = (mesh) => new mesh.position.constructor();
const quat = (mesh) => new mesh.quaternion.constructor();

// A static triangle mesh in world space: the mesh's world matrix (rotation, scale, position) is
// baked into its vertices, so the body sits at the origin unrotated.
export function addStaticMesh(p, mesh) {
  const geometry = mesh.geometry;
  const pos = geometry.attributes.position;
  const v = vec3(mesh);
  const positions = new Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
    positions[i * 3] = v.x;
    positions[i * 3 + 1] = v.y;
    positions[i * 3 + 2] = v.z;
  }
  const indices = geometry.index ? Array.from(geometry.index.array) : [...Array(pos.count).keys()];
  return rigidBody.create(p.world, {
    shape: triangleMesh.create({ positions, indices }),
    motionType: MotionType.STATIC,
    objectLayer: p.still,
  });
}

// A dynamic box the size of the mesh's bounding box, or a sphere around it (its geometry centred
// on its origin, as A-Frame's primitives are), where the mesh is in the world, moving at
// `velocity` (m/s). Spheres bounce a little. Both are cast along their path on steps where
// they move fast (continuous collision), so a thrown one doesn't pass through a mesh between steps.
export function addDynamic(p, mesh, shape = 'box', velocity = [0, 0, 0]) {
  const geometry = mesh.geometry;
  const position = vec3(mesh);
  const scale = vec3(mesh);
  const quaternion = quat(mesh);
  mesh.matrixWorld.decompose(position, quaternion, scale);
  const body = rigidBody.create(p.world, {
    ...(shape === 'sphere' ? sphereSettings(geometry, scale) : boxSettings(geometry, scale)),
    motionType: MotionType.DYNAMIC,
    motionQuality: MotionQuality.LINEAR_CAST,
    objectLayer: p.moving,
    position: [position.x, position.y, position.z],
    quaternion: [quaternion.x, quaternion.y, quaternion.z, quaternion.w],
  });
  rigidBody.setLinearVelocity(p.world, body, velocity);
  return body;
}

function boxSettings(geometry, scale) {
  if (!geometry.boundingBox) geometry.computeBoundingBox();
  const size = geometry.boundingBox.getSize(scale.clone()).multiply(scale);
  return { shape: box.create({ halfExtents: [Math.abs(size.x) / 2, Math.abs(size.y) / 2, Math.abs(size.z) / 2] }) };
}

function sphereSettings(geometry, scale) {
  if (!geometry.boundingSphere) geometry.computeBoundingSphere();
  const radius = geometry.boundingSphere.radius * Math.max(Math.abs(scale.x), Math.abs(scale.y), Math.abs(scale.z));
  // Damping stands in for rolling resistance: without it a ball rolls on forever.
  return { shape: sphere.create({ radius }), restitution: 0.5, friction: 0.6, angularDamping: 2 };
}

/** @param {'static' | 'dynamic'} type @param {'box' | 'sphere'} [shape] */
export function addBody(p, type, mesh, shape, velocity) {
  return type === 'static' ? addStaticMesh(p, mesh) : addDynamic(p, mesh, shape, velocity);
}

export function removeBody(p, id) {
  const body = rigidBody.get(p.world, id);
  if (body) rigidBody.remove(p.world, body);
}

export function getBody(p, id) {
  return rigidBody.get(p.world, id);
}

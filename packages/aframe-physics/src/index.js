// Physics for A-Frame with crashcat (pure JS, its own BVH for triangle meshes). Importing this
// registers the scene's `physics` system, which steps the world in its tick (A-Frame's frames,
// so it runs in VR too), and `physics-body`: `type: static` makes a static triangle mesh of an
// entity's mesh (a floor, a terrain), `type: dynamic` a box the size of its mesh
// (or `shape: sphere`, a ball around it) that the world moves, starting at `velocity` (m/s).
// Bodies are made from where the entity is when its mesh is set; moving a static one afterwards
// doesn't move its body. Also registers `ball-thrower` (ball-thrower.js).
import { addBody, createPhysicsWorld, getBody, removeBody, step } from './world.js';
import './ball-thrower.js';

const { THREE } = AFRAME;

AFRAME.registerSystem('physics', {
  schema: { gravity: { type: 'number', default: -9.81 } },
  init() {
    this.physics = createPhysicsWorld(this.data.gravity);
    this.dynamic = new Set();
  },
  tick(_t, dt) {
    // Nothing moves without a dynamic body.
    if (!dt || !this.dynamic.size) return;
    step(this.physics, dt / 1000);
    for (const component of this.dynamic) component.sync();
  },
});

const _q = new THREE.Quaternion();

AFRAME.registerComponent('physics-body', {
  schema: {
    type: { type: 'string', default: 'dynamic', oneOf: ['static', 'dynamic'] },
    shape: { type: 'string', default: 'box', oneOf: ['box', 'sphere'] },
    velocity: { type: 'vec3' },
  },
  init() {
    // A-Frame only links a component to the system of the same name.
    this.system = this.el.sceneEl.systems.physics;
    this.bodyId = null;
    this.onSet = (e) => { if (e.detail.type === 'mesh' && e.target === this.el) this.build(); };
    this.el.addEventListener('object3dset', this.onSet);
    this.build();
  },
  remove() {
    this.el.removeEventListener('object3dset', this.onSet);
    this.clear();
  },
  build() {
    const mesh = this.el.getObject3D('mesh');
    if (!mesh?.geometry?.attributes.position) return;
    this.clear();
    mesh.updateWorldMatrix(true, false);
    const { type, shape, velocity: v } = this.data;
    this.bodyId = addBody(this.system.physics, type, mesh, shape, [v.x, v.y, v.z]).id;
    if (type === 'dynamic') this.system.dynamic.add(this);
  },
  clear() {
    if (this.bodyId === null) return;
    removeBody(this.system.physics, this.bodyId);
    this.system.dynamic.delete(this);
    this.bodyId = null;
  },
  // The body's world pose onto the entity, in its parent's space.
  sync() {
    const body = getBody(this.system.physics, this.bodyId);
    if (!body) return;
    const o = this.el.object3D;
    o.position.fromArray(body.position);
    o.quaternion.fromArray(body.quaternion);
    if (o.parent) {
      o.parent.updateWorldMatrix(true, false);
      o.parent.worldToLocal(o.position);
      o.quaternion.premultiply(o.parent.getWorldQuaternion(_q).invert());
    }
  },
});

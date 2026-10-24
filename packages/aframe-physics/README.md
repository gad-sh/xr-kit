# @gadxr/aframe-physics

Rigid body physics for A-Frame with [crashcat](https://github.com/isaac-mason/crashcat), a
physics engine in plain JavaScript (no WebAssembly). Static meshes to stand things on (a floor, a
terrain), boxes and balls that fall, bounce and roll on them, and a ball to throw from a VR
controller.

```js
import 'aframe';      // first: this package registers components on the global AFRAME
import '@gadxr/aframe-physics';
```

```html
<a-entity gltf-model="#terrain" physics-body="type: static"></a-entity>
<a-box position="0 5 -3" physics-body></a-box>
<a-sphere radius="0.2" position="1 3 -3" physics-body="shape: sphere; velocity: 2 4 0"></a-sphere>
<a-entity laser-controls="hand: right" ball-thrower></a-entity>
```

- **`physics`** (the scene's system, registered on import): one crashcat world, stepped in A-Frame's
  tick, so it keeps running in VR (where the page's `requestAnimationFrame` is paused). A step is at
  most 1/30 s: a slow frame or a tab in the background slows things down rather than letting them
  fall through the floor. Nothing is stepped while there's no dynamic body. `gravity` (default
  `-9.81`, m/s² on y) can be set on the scene: `physics="gravity: -1.6"`.
- **`physics-body`**: made from the entity's mesh (`getObject3D('mesh')`, waiting for it if it
  isn't set yet), where the entity is at that moment.
  - `type: static`: a triangle mesh of every triangle, with the entity's rotation, scale and
    position baked in. For floors and terrain. Moving the entity afterwards doesn't move the body.
  - `type: dynamic` (default): `shape: box` (default), a box the size of the mesh's bounding box,
    or `shape: sphere`, a ball around it (bouncy, and slowing as it rolls). The world moves the entity. `velocity` (m/s) is
    what it starts with. Moving fast, it's cast along its path each step (continuous collision),
    so it doesn't pass through a thin mesh between steps.
  - Geometry is expected to be centred on the entity, as A-Frame's primitives are.
- **`ball-thrower`** on a controller: hold B for a ball in the hand; let go to throw it with the
  hand's velocity over the last 80 ms. That's measured relative to the hand's parent (the rig), so
  a teleport or snap turn while holding doesn't fling it. The last 20 balls stay. `radius`
  (default 0.06 m) and `color`.

## A fix for crashcat 0.0.5

crashcat 0.0.5's shape casts against triangle meshes return the hit's penetration axis reversed,
and continuous collision drops every hit whose axis points against the motion: a fast ball or box
goes straight through a terrain. `src/cast-fix.js` wraps crashcat's cast functions against
triangle meshes (through its `collisionDispatch` table) and corrects each hit, so nothing has to be
patched in `node_modules`. The tests include one that fails once crashcat no longer needs it.

## Size and speed

crashcat is tree-shakeable, but this registers every shape (`registerAll`): it adds about 85 kB
gzipped to the starter's build. Building a static body costs time once: about 12 ms for a 2k-triangle
terrain, measured on an M-series Mac. crashcat builds its own tree for the mesh, separate from
`@gadxr/aframe-bvh`'s (which is for three.js raycasts); use both on a terrain you teleport onto
and throw things at.

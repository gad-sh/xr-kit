# aframe-bvh

Fast raycasts against big static meshes in A-Frame, with
[three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh). A bounding volume hierarchy lets a
ray test a handful of triangles instead of every one, which matters for teleport: `blink-controls`
casts 10–20 short rays per frame while you aim, and without a tree each tests every triangle of
every collision mesh it comes near.

```js
import 'aframe';      // first: this package patches A-Frame's three.js
import 'aframe-bvh';
```

```html
<a-entity gltf-model="#scan" class="floor" bvh></a-entity>
```

- Importing it patches `THREE.Mesh.prototype.raycast` for the whole page. Meshes without a tree
  raycast exactly as before, so the UI lasers and everything else are unaffected.
- `bvh` builds a tree for every mesh under its entity, including child entities and meshes set
  later (a model that finishes loading). Building costs time once per mesh: about 4 ms for 2k triangles, 130 ms for 500k triangles, measured on an M-series Mac.
- Only for meshes whose vertices don't change afterwards: the tree isn't rebuilt. (A geometry
  that's replaced raycasts the old way until something sets a mesh on the entity again.)

## One three.js

three-mesh-bvh imports `'three'` and has to get the copy A-Frame renders with. With A-Frame from
npm that's `super-three`, which this package depends on as `three` at A-Frame 1.8's version, so
pnpm gives three-mesh-bvh the same package: no config needed. Keep that version A-Frame's when
upgrading A-Frame; otherwise the page gets a second three.js and this warns
`three-mesh-bvh got a different three.js than A-Frame's`.

A page that loads A-Frame with a script tag aliases `'three'` in its Vite config
to a module that re-exports the global `THREE` (`src/three-global.js`).

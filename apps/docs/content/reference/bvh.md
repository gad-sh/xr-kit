---
title: Fast raycasts (bvh)
description: @xr-kit/aframe-bvh: bounding volume hierarchies for big static meshes with three-mesh-bvh, so teleport arcs and lasers stay fast.
---

```sh
pnpm add @xr-kit/aframe-bvh
```

```ts
// main.ts, after A-Frame: this package patches A-Frame's three.js
import 'aframe';
import '@xr-kit/aframe-bvh';
```

```html
<a-entity gltf-model="#scan" class="floor" bvh></a-entity>
```

A bounding volume hierarchy lets a ray test a handful of triangles instead of every one. That matters for teleport: `blink-controls` casts 10–20 short rays per frame while you aim, and without a tree each one tests every triangle of every collision mesh it comes near. Measured on a 2k-triangle terrain, aiming went from about 1–1.5 ms to 0.015 ms per frame.

- Importing it patches `THREE.Mesh.prototype.raycast` for the whole page. Meshes without a tree raycast exactly as before, so the UI lasers and everything else are unaffected.
- `bvh` builds a tree for every mesh under its entity, including child entities and meshes set later (a model that finishes loading). Building costs time once per mesh: about 4 ms for 2k triangles, 130 ms for 500k (M-series Mac).
- Only for meshes whose vertices don't change afterwards: the tree isn't rebuilt. A geometry that's replaced raycasts the old way until something sets a mesh on the entity again.

## One three.js

three-mesh-bvh imports `'three'` and has to get the copy A-Frame renders with.

**npm A-Frame** (`import 'aframe'`): nothing to do. A-Frame's three.js is `super-three`, which this package depends on as `three` at A-Frame 1.8's version, so the package manager gives three-mesh-bvh the same copy. When you upgrade A-Frame, keep them in step; otherwise the page gets a second three.js and this warns `three-mesh-bvh got a different three.js than A-Frame's`.

**Script-tag A-Frame**: alias `'three'` to a module that re-exports the global `THREE`, by name, with every name three-mesh-bvh imports:

```js
// src/three-global.js
const THREE = globalThis.THREE;
export const {
  BackSide, BatchedMesh, Box3, BufferAttribute, BufferGeometry, Color, DoubleSide, FrontSide,
  Group, Line, Line3, LineBasicMaterial, LineLoop, LineSegments, Material, MathUtils, Matrix3,
  Matrix4, Mesh, MeshBasicMaterial, Object3D, Plane, Points, REVISION, Ray, Raycaster,
  SkinnedMesh, Sphere, Triangle, Vector2, Vector3, Vector4,
} = THREE;
export default THREE;
```

```ts
// vite.config.ts
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: { alias: { three: fileURLToPath(new URL('./src/three-global.js', import.meta.url)) } },
  // …
});
```

Don't alias `'three'` in a page that imports npm A-Frame: A-Frame's module build imports `'three'` itself, and the alias makes it wait on its own global.

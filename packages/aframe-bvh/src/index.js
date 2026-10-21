// Fast raycasts against big static meshes with three-mesh-bvh: a bounding volume hierarchy lets a
// ray test a few triangles instead of all of them (teleport arcs cast many short rays every frame).
// Importing this patches A-Frame's three.js once, for every raycast in the page; meshes without
// a tree raycast exactly as before. Put `bvh` on an entity to build trees for its meshes.
import { Mesh } from 'three';
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh';

// three-mesh-bvh has to extend the three.js A-Frame renders with. With npm A-Frame that's
// super-three, which this package depends on as 'three' (keep its version A-Frame's); a page
// that loads A-Frame with a script tag aliases 'three' to the global instead.
const { THREE } = AFRAME;
if (Mesh !== THREE.Mesh) console.warn("aframe-bvh: three-mesh-bvh got a different three.js than A-Frame's");
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

// Builds a tree for every mesh under the entity, now and whenever one is set (`object3dset`
// bubbles up from child entities). Only for meshes whose vertices don't move afterwards:
// the tree isn't rebuilt when they change (a replaced geometry just raycasts the old way).
AFRAME.registerComponent('bvh', {
  // No options: a single property, so a bare `bvh` attribute parses without a warning.
  schema: { type: 'boolean', default: true },
  init() {
    this.build = this.build.bind(this);
    this.el.addEventListener('object3dset', this.build);
    this.build();
  },
  remove() {
    this.el.removeEventListener('object3dset', this.build);
  },
  build() {
    this.el.object3D.traverse((o) => {
      if (o.isMesh && !o.geometry.boundsTree && o.geometry.attributes.position) o.geometry.computeBoundsTree();
    });
  },
});

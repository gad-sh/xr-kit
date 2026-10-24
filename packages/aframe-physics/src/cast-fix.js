// A fix for crashcat 0.0.5: its shape casts against triangle meshes return the hit's penetration
// axis reversed (pointing out of the mesh, where every other cast, and every user of a cast hit,
// expects it to point from the moving shape into what it hit). Continuous collision (CCD) checks
// that axis against the motion and drops every such hit, so a fast ball goes through a terrain
// mesh. Two slips: the sphere-vs-mesh cast negates the axis it should copy, and the
// convex-vs-mesh cast picks the triangle normal's sign backwards when correcting an inactive
// edge (always, on a flat mesh). Drop this once a crashcat release fixes it.
//
// crashcat looks its cast functions up in `collisionDispatch.castFns`, so this wraps the ones
// against a triangle mesh, correcting each hit before the caller's collector sees it.
import { collisionDispatch, ShapeType } from 'crashcat';

const FIXED = Symbol('gadxr cast fix');

// Wraps every registered cast against a triangle mesh once; call after registering shapes.
export function fixTriangleMeshCasts() {
  for (const [typeA, fns] of collisionDispatch.castFns) {
    const cast = fns.get(ShapeType.TRIANGLE_MESH);
    if (!cast || cast[FIXED]) continue;
    const fixed = typeA === ShapeType.SPHERE ? fixedSphereCast(cast) : fixedConvexCast(cast);
    fixed[FIXED] = true;
    fixed.original = cast; // for the test that tells when crashcat no longer needs this
    fns.set(ShapeType.TRIANGLE_MESH, fixed);
  }
}

// Every hit's axis and normal are reversed.
function fixedSphereCast(cast) {
  return function (collector, ...args) {
    const wrapped = Object.create(collector);
    wrapped.addHit = (hit) => {
      flip(hit);
      collector.addHit(hit);
    };
    return cast(wrapped, ...args);
  };
}

// Only some hits are reversed. A shape that moved into contact (fraction > 0) moved along the
// axis, so an axis against the motion is a reversed one. (A hit at fraction 0, touching from the
// start, is left alone: CCD doesn't act on those.)
function fixedConvexCast(cast) {
  return function (collector, settings, shapeA, subShapeIdA, subShapeIdBitsA, px, py, pz, qx, qy, qz, qw, sx, sy, sz, dx, dy, dz, ...rest) {
    const wrapped = Object.create(collector);
    wrapped.addHit = (hit) => {
      const a = hit.penetrationAxis;
      if (hit.fraction > 0 && a[0] * dx + a[1] * dy + a[2] * dz < 0) flip(hit);
      collector.addHit(hit);
    };
    return cast(wrapped, settings, shapeA, subShapeIdA, subShapeIdBitsA, px, py, pz, qx, qy, qz, qw, sx, sy, sz, dx, dy, dz, ...rest);
  };
}

function flip(hit) {
  for (let i = 0; i < 3; i++) {
    hit.penetrationAxis[i] = -hit.penetrationAxis[i];
    hit.normal[i] = -hit.normal[i];
  }
}

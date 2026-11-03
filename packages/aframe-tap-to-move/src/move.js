// What tap-to-move decides, kept free of A-Frame so it's tested in Node: whether a press was a
// tap, where on the floor it lands, and where the rig goes.

// A press is a tap, not a drag (looking around with the mouse or a finger), when the pointer
// stayed within TAP_SLOP_PX on screen, or, with no screen position (a laser, a tap in AR), its
// ray turned less than TAP_SLOP_DEG.
export const TAP_SLOP_PX = 10;
export const TAP_SLOP_DEG = 5;

// down, up: { screen: { x, y } | null, direction: THREE.Vector3 }
export function isTap(down, up) {
  if (down.screen && up.screen) {
    return Math.hypot(up.screen.x - down.screen.x, up.screen.y - down.screen.y) <= TAP_SLOP_PX;
  }
  return down.direction.angleTo(up.direction) <= (TAP_SLOP_DEG * Math.PI) / 180;
}

// Where a cursor's mousedown ('down') or mouseup ('up') happened on screen, from the DOM event
// A-Frame's cursor passes along; null for a laser or an XR select. The cursor reuses its event
// detail and keeps the last mouse and the last touch event in it, so only the newer one counts,
// and only if it's of this phase.
export function screenPoint(detail, phase) {
  const { mouseEvent: mouse, touchEvent: touch } = detail;
  const latest = mouse && touch ? (touch.timeStamp > mouse.timeStamp ? touch : mouse) : (mouse ?? touch);
  if (latest?.type === (phase === 'down' ? 'touchstart' : 'touchend')) {
    const point = (phase === 'down' ? latest.touches : latest.changedTouches)[0];
    return point ? { x: point.clientX, y: point.clientY } : null;
  }
  if (latest?.type === (phase === 'down' ? 'mousedown' : 'mouseup')) return { x: latest.clientX, y: latest.clientY };
  return null;
}

// The first mesh the ray meets decides: a floor (isFloor) facing up within maxAngle degrees is
// where to go; anything else in the way (a panel, a wall, a floor's steep side) is a miss.
// Returns the point, or null.
export function findLanding(THREE, raycaster, meshes, isFloor, maxAngle) {
  const [hit] = raycaster.intersectObjects(meshes, false);
  if (!hit || !hit.face || !isFloor(hit.object)) return null;
  const normal = hit.face.normal
    .clone()
    .applyMatrix3(new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld))
    .normalize();
  return normal.angleTo(new THREE.Vector3(0, 1, 0)) <= (maxAngle * Math.PI) / 180 ? hit.point : null;
}

// Where the rig goes (world space) so the camera ends up over the point: across the floor by the
// point minus the camera, which keeps where the camera is in the rig (a headset's room-scale
// offset), and up or down to the point's height, as the rig stands on the floor.
export function rigTarget(rig, camera, point) {
  return { x: rig.x + point.x - camera.x, y: point.y, z: rig.z + point.z - camera.z };
}

// Eases a glide in and out (t from 0 to 1).
export const smoothstep = (t) => t * t * (3 - 2 * t);

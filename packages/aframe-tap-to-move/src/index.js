// Tap to move: tap a spot on the floor (click it, or point a laser at it and pull the trigger)
// and the rig moves there. For a phone or a desktop, which have no thumbstick to teleport with,
// and in VR as an alternative to teleport. Put it on the rig, the entity holding the camera:
//   <a-entity id="rig" tap-to-move="collisionEntities: .floor"> <a-entity camera …> …
// It listens to every A-Frame cursor in the scene (the mouse, which also takes touches, the
// lasers, a cursor for taps in AR), so the floor needn't be one of their raycaster's objects.
import { findLanding, isTap, rigTarget, screenPoint, smoothstep } from './move.js';

const { THREE } = AFRAME;

AFRAME.registerComponent('tap-to-move', {
  schema: {
    enabled: { default: true },
    // What you can move onto. The first mesh the tap's ray meets has to be one of these (anything
    // visible in front blocks it), facing up within landingMaxAngle degrees.
    collisionEntities: { default: '' },
    landingMaxAngle: { default: 45, min: 0, max: 180 },
    // Glide speed in meters per second on a screen, and in an immersive session; 0 jumps. In a
    // headset it jumps by default: gliding you around makes many people queasy.
    speed: { default: 3, min: 0 },
    vrSpeed: { default: 0, min: 0 },
    // Whose position lands over the tap: the scene's camera when unset.
    camera: { type: 'selector' },
  },

  init() {
    this.raycaster = new THREE.Raycaster();
    // three-mesh-bvh (@gadxr/aframe-bvh): only the nearest hit of each mesh.
    this.raycaster.firstHitOnly = true;
    // The pending press of each cursor: { point, screen, direction }.
    this.presses = new Map();
    this.glide = null;
    this.onDown = this.onDown.bind(this);
    this.onUp = this.onUp.bind(this);
    this.cancelGlide = () => (this.glide = null);
    const scene = this.el.sceneEl;
    // Cursors emit mousedown/mouseup on themselves (with what they hit as `intersectedEl`),
    // and those bubble to the scene.
    scene.addEventListener('mousedown', this.onDown);
    scene.addEventListener('mouseup', this.onUp);
    // Teleporting (blink-controls) mid-glide: stay where it put you.
    scene.addEventListener('teleported', this.cancelGlide);
  },

  update() {
    if (!this.data.collisionEntities) console.warn('tap-to-move: set collisionEntities (e.g. .floor), or nothing can be moved onto');
    if (!this.data.enabled) this.presses.clear();
  },

  remove() {
    const scene = this.el.sceneEl;
    scene.removeEventListener('mousedown', this.onDown);
    scene.removeEventListener('mouseup', this.onUp);
    scene.removeEventListener('teleported', this.cancelGlide);
  },

  // A cursor's own event, from a press that didn't land on anything clickable (the UI, or any
  // `.raycastable`), or null. A floor that's raycastable itself still counts as the floor.
  cursorEvent(event) {
    const cursorEl = event.target;
    const detail = event.detail;
    if (!this.data.enabled || !this.data.collisionEntities || !cursorEl.components?.cursor) return null;
    if (!detail || detail.cursorEl) return null;
    const hit = detail.intersectedEl;
    if (hit && !hit.closest(this.data.collisionEntities)) return null;
    return { cursorEl, detail };
  },

  // The cursor's ray, up to date. With a screen position (the mouse cursor, a touch), from the
  // camera through it now: the mouse cursor only recasts when the mouse moves, so after a glide
  // its ray still starts where the camera was.
  rayOf(cursorEl, screen) {
    if (screen && cursorEl.getAttribute('cursor').rayOrigin === 'mouse') {
      const scene = this.el.sceneEl;
      const rect = scene.canvas.getBoundingClientRect();
      scene.camera.updateWorldMatrix(true, false);
      const ndc = { x: ((screen.x - rect.left) / rect.width) * 2 - 1, y: -((screen.y - rect.top) / rect.height) * 2 + 1 };
      this.raycaster.setFromCamera(ndc, scene.camera);
      this.raycaster.far = cursorEl.components.raycaster.data.far;
      return this.raycaster.ray;
    }
    const raycaster = cursorEl.components.raycaster;
    raycaster.updateOriginDirection();
    this.raycaster.ray.copy(raycaster.raycaster.ray);
    this.raycaster.far = raycaster.data.far;
    return this.raycaster.ray;
  },

  onDown(event) {
    const press = this.cursorEvent(event);
    if (!press) {
      this.presses.delete(event.target);
      return;
    }
    const { cursorEl, detail } = press;
    const screen = screenPoint(detail, 'down');
    const ray = this.rayOf(cursorEl, screen);
    const point = this.landing(cursorEl);
    this.presses.set(cursorEl, { point: point?.clone(), screen, direction: ray.direction.clone() });
  },

  onUp(event) {
    const down = this.presses.get(event.target);
    this.presses.delete(event.target);
    const press = this.cursorEvent(event);
    if (!down?.point || !press) return;
    const up = { screen: screenPoint(press.detail, 'up'), direction: this.rayOf(press.cursorEl).direction };
    if (isTap(down, up)) this.moveTo(down.point, press.cursorEl);
  },

  // Where the ray rayOf just set lands on the floor, or null. Tested against every visible mesh, so
  // anything in front blocks it, plus the floors even when hidden (an invisible walkable mesh),
  // minus the pressing hand's own (its controller model).
  landing(cursorEl) {
    const scene = this.el.sceneEl;
    const floors = [...scene.querySelectorAll(this.data.collisionEntities)];
    const meshes = new Set();
    scene.object3D.traverseVisible((o) => o.isMesh && meshes.add(o));
    for (const floor of floors) floor.object3D.traverse((o) => o.isMesh && meshes.add(o));
    if (!cursorEl.isScene) cursorEl.object3D.traverse((o) => meshes.delete(o));
    const isFloor = (object) => {
      let o = object;
      while (o && !o.el) o = o.parent;
      return !!o && floors.some((floor) => floor.contains(o.el));
    };
    return findLanding(THREE, this.raycaster, [...meshes], isFloor, this.data.landingMaxAngle);
  },

  moveTo(point, cursorEl) {
    const camera = this.data.camera ?? this.el.sceneEl.camera.el;
    const from = this.el.object3D.getWorldPosition(new THREE.Vector3());
    const cameraWorld = camera.object3D.getWorldPosition(new THREE.Vector3());
    const to = new THREE.Vector3().copy(rigTarget(from, cameraWorld, point));
    const scene = this.el.sceneEl;
    const immersive = !!scene.xrSession && (scene.is('vr-mode') || scene.is('ar-mode'));
    const speed = immersive ? this.data.vrSpeed : this.data.speed;
    this.el.emit('tapmove', { point, from: from.clone(), to: to.clone(), cursorEl });
    const duration = speed > 0 ? (from.distanceTo(to) / speed) * 1000 : 0;
    this.glide = { from, to, duration, elapsed: 0 };
    if (!duration) this.tick(0, 0);
  },

  tick(time, delta) {
    const glide = this.glide;
    if (!glide) return;
    glide.elapsed += delta;
    const t = glide.duration ? Math.min(1, glide.elapsed / glide.duration) : 1;
    const position = new THREE.Vector3().lerpVectors(glide.from, glide.to, smoothstep(t));
    const parent = this.el.object3D.parent;
    if (parent) {
      parent.updateWorldMatrix(true, false);
      parent.worldToLocal(position);
    }
    this.el.object3D.position.copy(position);
    if (t < 1) return;
    this.glide = null;
    this.el.emit('tapmoveend', { position: glide.to.clone() });
  },
});

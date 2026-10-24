// `ball-thrower` on a controller: B (bbuttondown) puts a ball in the hand; letting go throws it
// with the hand's velocity. Held, the ball is a plain child of the hand; let go, it becomes a
// `physics-body` sphere in the scene where the hand is. The velocity is measured in the rig's
// space (the hand's parent), so a teleport or snap turn while holding doesn't fling the ball,
// then turned into the world's.
const { THREE } = AFRAME;

// How far back the hand's velocity is averaged over, and how many thrown balls stay in the world.
const VELOCITY_WINDOW_MS = 80;
const MAX_BALLS = 20;

const _pos = new THREE.Vector3();
const _q = new THREE.Quaternion();

AFRAME.registerComponent('ball-thrower', {
  schema: { radius: { type: 'number', default: 0.06 }, color: { type: 'color', default: '#ffcc33' } },
  init() {
    this.held = null;
    this.samples = [];
    this.balls = [];
    this.grab = this.grab.bind(this);
    this.release = this.release.bind(this);
    this.el.addEventListener('bbuttondown', this.grab);
    this.el.addEventListener('bbuttonup', this.release);
  },
  remove() {
    this.el.removeEventListener('bbuttondown', this.grab);
    this.el.removeEventListener('bbuttonup', this.release);
    this.held?.remove();
    for (const ball of this.balls) ball.remove();
  },
  tick(t) {
    if (!this.held) return;
    const samples = this.samples;
    samples.push({ t, p: this.el.object3D.position.clone() });
    while (samples.length > 2 && t - samples[1].t >= VELOCITY_WINDOW_MS) samples.shift();
  },
  grab() {
    if (this.held) return;
    this.samples = [];
    this.held = this.ball();
    this.el.appendChild(this.held);
  },
  release() {
    if (!this.held) return;
    this.held.object3D.getWorldPosition(_pos);
    this.held.remove();
    this.held = null;

    const velocity = this.velocity();
    const ball = this.ball();
    ball.setAttribute('position', `${_pos.x} ${_pos.y} ${_pos.z}`);
    ball.setAttribute('physics-body', { type: 'dynamic', shape: 'sphere', velocity });
    this.el.sceneEl.appendChild(ball);
    this.balls.push(ball);
    if (this.balls.length > MAX_BALLS) this.balls.shift().remove();
  },
  // The hand's velocity over the last few frames, in the world (m/s).
  velocity() {
    const s = this.samples;
    const v = new THREE.Vector3();
    if (s.length < 2) return v;
    const first = s[0], last = s[s.length - 1];
    const dt = (last.t - first.t) / 1000;
    if (dt <= 0) return v;
    v.subVectors(last.p, first.p).divideScalar(dt);
    const rig = this.el.object3D.parent;
    if (rig) v.applyQuaternion(rig.getWorldQuaternion(_q));
    return v;
  },
  ball() {
    const ball = document.createElement('a-sphere');
    ball.setAttribute('radius', this.data.radius);
    ball.setAttribute('color', this.data.color);
    ball.setAttribute('segments-width', '16');
    ball.setAttribute('segments-height', '12');
    return ball;
  },
});

// Placement components for 3D Surfaces, registered by ensure3d():
//   ui-follow — "lazy follow": the panel stays put while you look around a little,
//               then glides back in front of you when it's out of a comfort cone.
//   ui-attach — copies another entity's pose plus an offset each frame (wrist menus).
// Both work in world space, so the entity should not be a child of the camera.
// Erasable TypeScript only — tests import it with Node's type stripping.

/* eslint-disable @typescript-eslint/no-explicit-any */

export type HeadPose = { x: number; y: number; z: number; yaw: number };
export type FollowOptions = { distance: number; height: number; side: number };

// Where a follow panel wants to be: `distance` in front of the head (level, ignoring
// pitch), `height` relative to the eyes, `side` to the right; turned to face the head.
export function followGoal(head: HeadPose, { distance, height, side }: FollowOptions): HeadPose {
	const forward = { x: -Math.sin(head.yaw), z: -Math.cos(head.yaw) };
	const right = { x: Math.cos(head.yaw), z: -Math.sin(head.yaw) };
	return {
		x: head.x + forward.x * distance + right.x * side,
		y: head.y + height,
		z: head.z + forward.z * distance + right.z * side,
		yaw: head.yaw,
	};
}

// Smallest signed difference b - a between two angles (radians).
export function angleDelta(a: number, b: number): number {
	return Math.atan2(Math.sin(b - a), Math.cos(b - a));
}

// True when the panel has drifted far enough from its goal that it should move:
// outside `maxAngle` (degrees, around the head), or nearer/farther/higher/lower than
// the goal by more than `slack` meters.
export function needsRecentre(
	panel: { x: number; y: number; z: number },
	head: HeadPose,
	goal: HeadPose,
	maxAngle: number,
	slack = 0.3
): boolean {
	const bearing = (p: { x: number; z: number }) => Math.atan2(p.x - head.x, p.z - head.z);
	const reach = (p: { x: number; z: number }) => Math.hypot(p.x - head.x, p.z - head.z);
	return (
		Math.abs(angleDelta(bearing(panel), bearing(goal))) > (maxAngle * Math.PI) / 180 ||
		Math.abs(reach(panel) - reach(goal)) > slack ||
		Math.abs(panel.y - goal.y) > slack
	);
}

// Where a Surface's content goes. Immersive (a headset, or simulated): its `vr` placement,
// except a hand surface without real controllers falls back to follow. Otherwise: HTML in a
// screen region ('screen'), or 3D fixed in front of the camera ('camera').
export type VRPlacement = 'world' | 'follow' | 'hand';
export type DesktopPlacement = 'screen' | 'camera';
export function surfacePlacement(
	{ vr, desktop }: { vr: VRPlacement; desktop: DesktopPlacement },
	{ immersive, presenting }: { immersive: boolean; presenting: boolean }
): VRPlacement | DesktopPlacement {
	if (!immersive) return desktop;
	return vr === 'hand' && !presenting ? 'follow' : vr;
}

// Fraction of the remaining distance to cover this frame, for exponential easing.
export const easeStep = (dt: number, timeConstant: number) => (timeConstant > 0 ? 1 - Math.exp(-dt / timeConstant) : 1);

export function placementComponents(THREE: any) {
	const v = new THREE.Vector3();
	const q = new THREE.Quaternion();
	const e = new THREE.Euler();
	const m = new THREE.Matrix4();

	// Sets an object's world position and yaw, whatever its parent's transform.
	function setWorldPose(obj: any, x: number, y: number, z: number, yaw: number) {
		const parent = obj.parent;
		v.set(x, y, z);
		q.setFromEuler(e.set(0, yaw, 0, 'YXZ'));
		if (parent) {
			parent.updateWorldMatrix(true, false);
			parent.worldToLocal(v);
			const parentQ = new THREE.Quaternion();
			parent.getWorldQuaternion(parentQ);
			q.premultiply(parentQ.invert());
		}
		obj.position.copy(v);
		obj.quaternion.copy(q);
	}

	const follow = {
		schema: {
			enabled: { default: true },
			distance: { type: 'number', default: 1.2 },
			height: { type: 'number', default: -0.2 },
			side: { type: 'number', default: 0 },
			maxAngle: { type: 'number', default: 30 },
			// ms; how quickly it catches up once it moves.
			smoothing: { type: 'number', default: 250 },
		},
		init(this: any) {
			this.snap = true;
			this.moving = false;
			this.resnap = () => (this.snap = true);
			this.el.sceneEl?.addEventListener('enter-vr', this.resnap);
			this.el.sceneEl?.addEventListener('exit-vr', this.resnap);
		},
		update(this: any, old: any) {
			if (this.data.enabled && !old?.enabled) this.snap = true;
		},
		remove(this: any) {
			this.el.sceneEl?.removeEventListener('enter-vr', this.resnap);
			this.el.sceneEl?.removeEventListener('exit-vr', this.resnap);
		},
		tick(this: any, _t: number, dt: number) {
			const camera = this.el.sceneEl?.camera;
			if (!this.data.enabled || !camera) return;
			camera.getWorldPosition(v);
			camera.getWorldQuaternion(q);
			e.setFromQuaternion(q, 'YXZ');
			const head = { x: v.x, y: v.y, z: v.z, yaw: e.y };
			const goal = followGoal(head, this.data);

			const obj = this.el.object3D;
			obj.getWorldPosition(v);
			const panel = { x: v.x, y: v.y, z: v.z };
			if (this.snap) {
				this.snap = false;
				this.moving = false;
				this.yaw = goal.yaw;
				setWorldPose(obj, goal.x, goal.y, goal.z, goal.yaw);
				return;
			}
			if (!this.moving && needsRecentre(panel, head, goal, this.data.maxAngle)) this.moving = true;
			if (!this.moving) return;

			const k = easeStep(dt || 16, this.data.smoothing);
			const next = {
				x: panel.x + (goal.x - panel.x) * k,
				y: panel.y + (goal.y - panel.y) * k,
				z: panel.z + (goal.z - panel.z) * k,
			};
			this.yaw += angleDelta(this.yaw, goal.yaw) * k;
			setWorldPose(obj, next.x, next.y, next.z, this.yaw);
			const left = Math.hypot(goal.x - next.x, goal.y - next.y, goal.z - next.z);
			if (left < 0.005 && Math.abs(angleDelta(this.yaw, goal.yaw)) < 0.01) this.moving = false;
		},
	};

	const attach = {
		schema: {
			target: { type: 'selector' },
			// Offset in the target's space (meters / degrees).
			position: { type: 'vec3', default: { x: 0, y: 0.1, z: -0.05 } },
			rotation: { type: 'vec3', default: { x: -50, y: 0, z: 0 } },
		},
		init(this: any) {
			this.offset = new THREE.Matrix4();
			this.scale = new THREE.Vector3();
		},
		update(this: any) {
			const { position: p, rotation: r } = this.data;
			const rad = THREE.MathUtils.degToRad;
			this.offset.compose(
				new THREE.Vector3(p.x, p.y, p.z),
				new THREE.Quaternion().setFromEuler(new THREE.Euler(rad(r.x), rad(r.y), rad(r.z))),
				new THREE.Vector3(1, 1, 1)
			);
		},
		tick(this: any) {
			const target = this.data.target?.object3D;
			const obj = this.el.object3D;
			if (!target) return;
			// updateWorldMatrix(true, …) includes the ancestors: a rig that moved this frame
			// (walking, teleport) hasn't had its matrixWorld updated yet, which would leave
			// us a frame behind — visible jitter on a camera-attached menu while walking.
			target.updateWorldMatrix(true, false);
			m.multiplyMatrices(target.matrixWorld, this.offset);
			if (obj.parent) {
				obj.parent.updateWorldMatrix(true, false);
				m.premultiply(new THREE.Matrix4().copy(obj.parent.matrixWorld).invert());
			}
			// Keep our own scale; take only position and rotation from the target.
			m.decompose(obj.position, obj.quaternion, this.scale);
		},
	};

	return { follow, attach };
}

export function registerPlacement(AFRAME: any = (globalThis as any).AFRAME) {
	const { follow, attach } = placementComponents(AFRAME.THREE);
	if (!AFRAME.components['ui-follow']) AFRAME.registerComponent('ui-follow', follow);
	if (!AFRAME.components['ui-attach']) AFRAME.registerComponent('ui-attach', attach);
}

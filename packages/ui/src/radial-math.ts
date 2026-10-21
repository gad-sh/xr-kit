// Radial (pie) menu geometry and input, shared by the 2D and 3D renderers.
// Angles are in degrees, counterclockwise from +x (right), with +y up.
// Erasable TypeScript only — tests import it with Node's type stripping.

export type RadialLayout = {
	count: number;
	// Where wedge 0 starts.
	startAngle: number;
};

const DEG = Math.PI / 180;
const wrap = (deg: number) => ((deg % 360) + 360) % 360;

export const sectorAngle = (count: number) => 360 / count;

// Middle of wedge `index`.
export function wedgeCenter(index: number, { count, startAngle }: RadialLayout): number {
	return startAngle + (index + 0.5) * sectorAngle(count);
}

// The wedge a direction points into, or -1 for no direction (inside the deadzone).
export function wedgeAt(x: number, y: number, { count, startAngle }: RadialLayout, deadzone = 0): number {
	if (count <= 0 || Math.hypot(x, y) < deadzone) return -1;
	const angle = wrap(Math.atan2(y, x) / DEG - startAngle);
	return Math.floor(angle / sectorAngle(count)) % count;
}

// Point at `radius` and `angle` (degrees), as [x, y] with +y up.
export function polar(radius: number, angle: number): [number, number] {
	return [radius * Math.cos(angle * DEG), radius * Math.sin(angle * DEG)];
}

// SVG path (y down) for a ring sector, with `gap` degrees trimmed off each side.
export function sectorPath(index: number, layout: RadialLayout, inner: number, outer: number, gap = 0): string {
	const from = layout.startAngle + index * sectorAngle(layout.count) + gap / 2;
	const to = from + sectorAngle(layout.count) - gap;
	const large = to - from > 180 ? 1 : 0;
	const pt = (r: number, a: number) => {
		const [x, y] = polar(r, a);
		return `${x.toFixed(3)} ${(-y).toFixed(3)}`;
	};
	// SVG's y axis points down, so counterclockwise on screen is sweep-flag 0.
	return [
		`M ${pt(outer, from)}`,
		`A ${outer} ${outer} 0 ${large} 0 ${pt(outer, to)}`,
		`L ${pt(inner, to)}`,
		`A ${inner} ${inner} 0 ${large} 1 ${pt(inner, from)}`,
		'Z',
	].join(' ');
}

// Placement on a controller (Meta Touch): just in front of it, tilted so the top leans away,
// rolled 90°. The stick and label offsets match that roll. Tuned on the right hand on a
// Quest; the left is its mirror image (x and the y/z rotations negated, which
// turns the ring around, so the stick offset and label turn flip sign, and wedge 0 moves
// to the mirrored spot — the wedges then run the other way round).
export type Hand = 'left' | 'right';
export type ControllerPlacement = {
	position: string;
	rotation: string;
	startAngle: number;
	angleOffset: number;
	labelRotation: number;
	radius: number;
	innerRadius: number;
};
export const ON_CONTROLLER: Record<Hand, ControllerPlacement> = {
	right: { position: '-.02 -0.0766 -0.1428', rotation: '-60 -170 -90', startAngle: 0, angleOffset: 72, labelRotation: -90, radius: 32, innerRadius: 8 },
	left: { position: '.02 -0.0766 -0.1428', rotation: '-60 170 90', startAngle: 108, angleOffset: -72, labelRotation: 90, radius: 32, innerRadius: 8 },
};

// Hold-to-open, aim, release-to-pick — the same for a VR controller (trigger +
// thumbstick), a held key + mouse, or a long press. Aiming back to the centre keeps
// the last wedge, so letting go of the stick before the trigger still picks it.
export class RadialInput {
	open = false;
	selected = -1;
	layout: RadialLayout;
	deadzone: number;
	// Wedges that can't be picked.
	disabled: (index: number) => boolean;

	constructor(layout: RadialLayout, deadzone = 0.5, disabled: (index: number) => boolean = () => false) {
		this.layout = layout;
		this.deadzone = deadzone;
		this.disabled = disabled;
	}

	start() {
		this.open = true;
		this.selected = -1;
	}

	// Aim with a direction (stick axes, or a pointer offset from the centre).
	aim(x: number, y: number, angleOffset = 0) {
		if (!this.open) return;
		const index = wedgeAt(x, y, { ...this.layout, startAngle: this.layout.startAngle + angleOffset }, this.deadzone);
		if (index === -1) return;
		this.selected = this.disabled(index) ? -1 : index;
	}

	// Point straight at a wedge (hovering it with a cursor or laser).
	point(index: number) {
		if (this.open && !this.disabled(index)) this.selected = index;
	}

	// Closes the menu; returns the picked wedge, or -1.
	release(): number {
		if (!this.open) return -1;
		const picked = this.selected;
		this.open = false;
		this.selected = -1;
		return picked;
	}

	cancel() {
		this.open = false;
		this.selected = -1;
	}
}

// `rounded` A-Frame component (and <a-rounded> primitive): a rounded-rectangle slab,
// solid or glass. Owned by the design system and registered on first use, so apps
// don't need a <script> tag for it. Uses A-Frame's own three.js (AFRAME.THREE).
// Erasable TypeScript only — tests import it with Node's type stripping.

/* eslint-disable @typescript-eslint/no-explicit-any */

const glassMaterial = (THREE: any) =>
	new THREE.MeshPhysicalMaterial({
		roughness: 0.5,
		transmission: 1,
		thickness: 0.7,
		clearcoat: 0.61,
		clearcoatRoughness: 0.39,
	});

// The component definition, built against a given three.js (tests pass their own).
export function roundedComponent(THREE: any) {
	return {
		schema: {
			enabled: { default: true },
			width: { type: 'number', default: 1 },
			height: { type: 'number', default: 1 },
			// Extrude thickness; ignored when `flat`.
			depth: { type: 'number', default: 0.05 },
			radius: { type: 'number', default: 0.3 },
			topLeftRadius: { type: 'number', default: -1 },
			topRightRadius: { type: 'number', default: -1 },
			bottomLeftRadius: { type: 'number', default: -1 },
			bottomRightRadius: { type: 'number', default: -1 },
			color: { type: 'color', default: '#F0F0F0' },
			opacity: { type: 'number', default: 1 },
			glass: { type: 'boolean', default: false },
			flat: { type: 'boolean', default: false },
		},

		init(this: any) {
			// update() picks the material (glass or solid) right after init.
			this.rounded = new THREE.Mesh(
				this.draw(),
				new THREE.MeshPhongMaterial({ color: new THREE.Color(this.data.color), side: THREE.DoubleSide })
			);
			this.updateOpacity();
			this.el.setObject3D('mesh', this.rounded);
		},

		update(this: any) {
			if (!this.rounded) return;
			this.rounded.visible = this.data.enabled;
			if (!this.data.enabled) return;
			this.rounded.geometry.dispose();
			this.rounded.geometry = this.draw();
			// Swap materials only when `glass` changes, so frequent updates (hover colors, resizing)
			// don't leak materials, and turning glass off goes back to a solid slab.
			if (this.data.glass !== !!this.rounded.material.isMeshPhysicalMaterial) {
				this.rounded.material.dispose();
				this.rounded.material = this.data.glass
					? glassMaterial(THREE)
					: new THREE.MeshPhongMaterial({ side: THREE.DoubleSide });
			}
			// Glass stays clear; `color` only tints solid slabs.
			if (!this.data.glass) this.rounded.material.color.set(this.data.color);
			this.updateOpacity();
		},

		updateOpacity(this: any) {
			const opacity = Math.min(1, Math.max(0, this.data.opacity));
			this.rounded.material.transparent = opacity < 1;
			this.rounded.material.opacity = opacity;
		},

		remove(this: any) {
			if (!this.rounded) return;
			this.el.removeObject3D('mesh');
			this.rounded.geometry.dispose();
			this.rounded.material.dispose();
			this.rounded = null;
		},

		draw(this: any) {
			const d = this.data;
			const corner = (value: number) => (value !== -1 ? value : d.radius) || 0.00001;
			const tl = corner(d.topLeftRadius);
			const tr = corner(d.topRightRadius);
			const bl = corner(d.bottomLeftRadius);
			const br = corner(d.bottomRightRadius);
			const w = d.width;
			const h = d.height;

			const shape = new THREE.Shape();
			shape.moveTo(0, tl);
			shape.lineTo(0, h - tl);
			shape.quadraticCurveTo(0, h, tl, h);
			shape.lineTo(w - tr, h);
			shape.quadraticCurveTo(w, h, w, h - tr);
			shape.lineTo(w, br);
			shape.quadraticCurveTo(w, 0, w - br, 0);
			shape.lineTo(bl, 0);
			shape.quadraticCurveTo(0, 0, 0, bl);

			return d.flat
				? new THREE.ShapeGeometry(shape)
				: new THREE.ExtrudeGeometry(shape, { bevelEnabled: false, depth: d.depth });
		},
	};
}

// Registers `rounded` and <a-rounded> with the page's A-Frame, once.
export function registerRounded(AFRAME: any = (globalThis as any).AFRAME) {
	if (!AFRAME) throw new Error('gadxr ui: A-Frame must be loaded before 3D components are used');
	if (!AFRAME.components.rounded) AFRAME.registerComponent('rounded', roundedComponent(AFRAME.THREE));
	if (!AFRAME.primitives.primitives['a-rounded']) {
		AFRAME.registerPrimitive('a-rounded', {
			defaultComponents: { rounded: {} },
			mappings: {
				enabled: 'rounded.enabled',
				width: 'rounded.width',
				height: 'rounded.height',
				depth: 'rounded.depth',
				radius: 'rounded.radius',
				'top-left-radius': 'rounded.topLeftRadius',
				'top-right-radius': 'rounded.topRightRadius',
				'bottom-left-radius': 'rounded.bottomLeftRadius',
				'bottom-right-radius': 'rounded.bottomRightRadius',
				color: 'rounded.color',
				opacity: 'rounded.opacity',
			},
		});
	}
}

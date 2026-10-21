// What <Scene3D> does to its <a-scene>, kept free of Svelte so it's tested in Node: the
// mouse cursor and lasers aim at `.raycastable`, the mouse cursor is removed in VR, and
// troika-text (3D labels) is loaded if the page didn't load it.

/* eslint-disable @typescript-eslint/no-explicit-any */

// Cursors only hit entities with this class (on an entity that owns a mesh).
export const RAYCASTABLE = 'raycastable';
export const MOUSE_CURSOR = 'rayOrigin: mouse; fuse: false';
export const TROIKA_SCRIPT = 'https://unpkg.com/aframe-troika-text@0.14.0/dist/aframe-troika-text.min.js';

export type SceneOptions = {
	// The scene's cursor, restored after VR.
	cursor?: string;
	// Keep the mouse cursor in an immersive session (e.g. a demo that also runs on desktop).
	mouseCursorInVR?: boolean;
};

// Returns a function that undoes it.
export function setupScene(scene: any, { cursor = MOUSE_CURSOR, mouseCursorInVR = false }: SceneOptions = {}) {
	const cleanups: (() => void)[] = [];

	// Lasers: aim at `.raycastable` like the mouse, keeping the rest of their raycaster (far).
	// Set once the entity has loaded, so a raycaster written in its markup is set up first.
	const lasers = new WeakSet<Element>();
	const aim = (el: any) => el.setAttribute('raycaster', 'objects', `.${RAYCASTABLE}`);
	const watchLaser = (el: any) => {
		if (lasers.has(el)) return;
		lasers.add(el);
		if (el.hasLoaded) return aim(el);
		const onLoaded = (event: Event) => {
			if (event.target !== el) return;
			el.removeEventListener('loaded', onLoaded);
			aim(el);
		};
		el.addEventListener('loaded', onLoaded);
		cleanups.push(() => el.removeEventListener('loaded', onLoaded));
	};
	const findLasers = (node: any) => {
		if (node.nodeType !== 1) return;
		if (node.hasAttribute('laser-controls')) watchLaser(node);
		node.querySelectorAll('[laser-controls]').forEach(watchLaser);
	};
	findLasers(scene);
	// Hands mounted later (e.g. inside an {#if}) or given laser-controls later.
	const observer = new MutationObserver((records) => {
		for (const record of records) {
			if (record.type === 'attributes') findLasers(record.target);
			else record.addedNodes.forEach(findLasers);
		}
	});
	observer.observe(scene, { childList: true, subtree: true, attributes: true, attributeFilter: ['laser-controls'] });
	cleanups.push(() => observer.disconnect());

	// The mouse cursor is unused in a headset, but still hovers UI: it keeps casting along
	// its last mouse ray, and it hears the lasers' raycaster events (they bubble to the
	// scene), so its mouseleaves un-hover buttons a laser is still on. Remove it in VR
	// (raycaster off first, which sends the leaves for anything it hovers); restore it after.
	// enter-vr also fires for non-immersive fullscreen; only a real XR session counts.
	if (!mouseCursorInVR) {
		let removed = false;
		const onVR = (event: Event) => {
			const vr = event.type === 'enter-vr' && !!scene.xrSession;
			if (vr === removed) return;
			removed = vr;
			scene.setAttribute('raycaster', 'enabled', !vr);
			if (vr) scene.removeAttribute('cursor');
			else scene.setAttribute('cursor', cursor);
		};
		scene.addEventListener('enter-vr', onVR);
		scene.addEventListener('exit-vr', onVR);
		cleanups.push(() => {
			scene.removeEventListener('enter-vr', onVR);
			scene.removeEventListener('exit-vr', onVR);
		});
	}

	return () => cleanups.splice(0).forEach((cleanup) => cleanup());
}

let troika: Promise<void> | undefined;

// Resolves once A-Frame has `troika-text`, adding the pinned script if it isn't registered
// (or being loaded) yet; null when it's already there, so a page that loads it needn't wait.
// A script that fails to load is logged and still resolves: the scene shows, without labels.
export function loadTroika(): Promise<void> | null {
	if ((globalThis as any).AFRAME.components['troika-text']) return null;
	troika ??= new Promise<void>((resolve) => {
		const existing = document.querySelector<HTMLScriptElement>(`script[src="${TROIKA_SCRIPT}"]`);
		const script = existing ?? document.createElement('script');
		const done = () => {
			if (!(globalThis as any).AFRAME.components['troika-text']) {
				console.error(`gadxr ui: couldn't load troika-text from ${TROIKA_SCRIPT}; 3D labels won't show.`);
			}
			resolve();
		};
		script.addEventListener('load', done, { once: true });
		script.addEventListener('error', done, { once: true });
		if (!existing) {
			script.src = TROIKA_SCRIPT;
			document.head.appendChild(script);
		}
	});
	return troika;
}

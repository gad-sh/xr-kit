// Whether the player is in an immersive (headset) session — the signal Surfaces use
// to switch from HTML to 3D. `simulated` forces 3D on desktop for testing and demos.
//   import { xr } from '$lib/ui';  xr.simulated = true;  if (xr.immersive) …

class XRState {
	presenting = $state(false);
	simulated = $state(false);

	get immersive() {
		return this.presenting || this.simulated;
	}

	#watched = new WeakSet<EventTarget>();

	// Follows a scene's enter-vr / exit-vr. Called by every Surface; each scene is watched once.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	watch(scene: any) {
		if (!scene || this.#watched.has(scene)) return;
		this.#watched.add(scene);
		// enter-vr also fires for non-immersive fullscreen; only a real XR session counts.
		const update = () => (this.presenting = !!scene.xrSession && (scene.is('vr-mode') || scene.is('ar-mode')));
		scene.addEventListener('enter-vr', update);
		scene.addEventListener('exit-vr', update);
		update();
	}
}

export const xr = new XRState();

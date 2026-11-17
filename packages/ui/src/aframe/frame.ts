// Runs `callback` once per rendered frame until the returned stop() is called.
// While an immersive XR session is running, the page's requestAnimationFrame is paused
// (frames come from the session instead), so this uses the session's loop then, switching
// when VR starts or ends mid-loop.

/* eslint-disable @typescript-eslint/no-explicit-any */
export function everyFrame(scene: any, callback: () => void): () => void {
	let stopped = false;
	let id = 0;
	let source: any = globalThis;
	const loop = () => {
		if (stopped) return;
		callback();
		schedule();
	};
	const schedule = () => {
		source = scene?.xrSession ?? globalThis;
		id = source.requestAnimationFrame(loop);
	};
	// A frame queued on the page loop just before entering VR would never run (and one on
	// the session loop dies with the session), so switch loops when VR starts or ends.
	const reschedule = () => {
		if (stopped) return;
		source.cancelAnimationFrame?.(id);
		schedule();
	};
	schedule();
	scene?.addEventListener?.('enter-vr', reschedule);
	scene?.addEventListener?.('exit-vr', reschedule);
	return () => {
		stopped = true;
		source.cancelAnimationFrame?.(id);
		scene?.removeEventListener?.('enter-vr', reschedule);
		scene?.removeEventListener?.('exit-vr', reschedule);
	};
}

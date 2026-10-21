// Gets the page's A-Frame ready for the design system's 3D components.
import { registerPlacement } from './placement';
import { registerRounded } from './rounded';
import { TROIKA_SCRIPT } from './scene';

let checkedTroika = false;

// `rounded`, `ui-follow` and `ui-attach` ship with the library and are registered here. `troika-text` can't be
// bundled without pulling in a second copy of three.js / A-Frame, so it's loaded as a script:
// <Scene3D> adds it if the page didn't (otherwise load aframe-troika-text after A-Frame).
export function ensure3d() {
	registerRounded();
	registerPlacement();
	if (checkedTroika) return;
	checkedTroika = true;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	if (!(globalThis as any).AFRAME.components['troika-text']) {
		console.error(
			`gadxr ui: 3D labels need the A-Frame troika-text component. Add <script src="${TROIKA_SCRIPT}"></script> after A-Frame.`
		);
	}
}

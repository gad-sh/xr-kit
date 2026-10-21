// The library's own copy of Geist (OFL, see assets/Geist-OFL.txt), so 3D text
// doesn't depend on files the app serves.
import geistUrl from './assets/Geist-Regular.ttf?url';
import type { Theme } from './theme';

// troika loads fonts by URL; an empty `typography.font3d` means the bundled Geist.
export function font3d(theme: Theme): string {
	return theme.typography.font3d || geistUrl;
}

// Reports a troika-text entity's layout whenever its text re-syncs: its size (meters),
// or the whole textRenderInfo (caret positions etc.) for text fields.

/* eslint-disable @typescript-eslint/no-explicit-any */
export function watchTextLayout(el: HTMLElement, onLayout: (info: any) => void): () => void {
	const entity = el as HTMLElement & { components?: Record<string, any> };
	let mesh: any;
	const report = () => {
		if (mesh?.textRenderInfo) onLayout(mesh.textRenderInfo);
	};
	const attach = () => {
		mesh = entity.components?.['troika-text']?.troikaTextMesh;
		if (!mesh) return false;
		mesh.addEventListener('synccomplete', report);
		report();
		return true;
	};
	const onInitialized = (event: Event) => {
		if ((event as CustomEvent).detail?.name === 'troika-text' && attach()) {
			el.removeEventListener('componentinitialized', onInitialized);
		}
	};
	if (!attach()) el.addEventListener('componentinitialized', onInitialized);
	return () => {
		el.removeEventListener('componentinitialized', onInitialized);
		mesh?.removeEventListener('synccomplete', report);
	};
}

export function watchTextSize(el: HTMLElement, onSize: (width: number, height: number) => void): () => void {
	return watchTextLayout(el, (info) => {
		const bounds = info.blockBounds;
		if (bounds) onSize(bounds[2] - bounds[0], bounds[3] - bounds[1]);
	});
}

// Sets troika's text on its own, not through the attribute string: A-Frame splits
// those on `;`, which a user can type.
export function setTroikaValue(el: HTMLElement | undefined, value: string) {
	(el as any)?.setAttribute('troika-text', 'value', value);
}

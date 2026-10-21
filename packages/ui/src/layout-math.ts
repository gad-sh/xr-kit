// 3D layout: stacks items in a row or column, centered on the stack's origin.
// Pure math, shared by every container (ButtonGroup, Panel). Units are meters.
// Erasable TypeScript only — tests import it with Node's type stripping.

export type Size = { width: number; height: number };
// Cross-axis alignment: 'start' = left (column) / top (row), 'end' = right / bottom.
export type Align = 'start' | 'center' | 'end';
// An item can override the stack's alignment for itself (like CSS align-self).
export type Item = Size & { align?: Align };
export type StackOptions = {
	direction: 'row' | 'column';
	gap: number;
	align?: Align;
};
export type StackLayout = Size & { offsets: { x: number; y: number }[] };

export function stackLayout(sizes: Item[], { direction, gap, align = 'center' }: StackOptions): StackLayout {
	const row = direction === 'row';
	const main = (s: Size) => (row ? s.width : s.height);
	const cross = (s: Size) => (row ? s.height : s.width);
	const totalMain = sizes.reduce((sum, s) => sum + main(s), 0) + gap * Math.max(0, sizes.length - 1);
	const totalCross = sizes.reduce((max, s) => Math.max(max, cross(s)), 0);

	let cursor = -totalMain / 2;
	const offsets = sizes.map((s) => {
		const along = cursor + main(s) / 2;
		cursor += main(s) + gap;
		const a = s.align ?? align;
		const across = a === 'start' ? -totalCross / 2 + cross(s) / 2 : a === 'end' ? totalCross / 2 - cross(s) / 2 : 0;
		// Rows run left to right; columns run top to bottom (+y is up).
		return row ? { x: along, y: -across } : { x: across, y: -along };
	});

	return row
		? { width: totalMain, height: totalCross, offsets }
		: { width: totalCross, height: totalMain, offsets };
}

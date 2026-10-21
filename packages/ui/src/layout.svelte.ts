// 3D layout context. A container (ButtonGroup, Panel) creates a stack; each 3D
// component inside calls useSlot() to report its size and get its position back.
// In 2D, CSS does the layout and none of this is used.
import { getContext, setContext } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import { stackLayout, type Item, type Size, type StackOptions } from './layout-math';

const STACK = Symbol('ui-stack');

export type Position = { x: number; y: number };

export type Stack = {
	register(): number;
	unregister(id: number): void;
	setSize(id: number, size: Item): void;
	offset(id: number): Position;
	readonly size: Size;
};

export function createStack(options: () => StackOptions): Stack {
	// Ids increase in registration order, which is the layout order.
	let nextId = 0;
	const sizes = new SvelteMap<number, Item>();

	// Iterating the map (not a plain list of ids) subscribes to items being added and
	// removed, even when the layout is first read before any child has registered.
	const layout = $derived.by(() => {
		const ids = [...sizes.keys()].sort((a, b) => a - b);
		const result = stackLayout(
			ids.map((id) => sizes.get(id)!),
			options()
		);
		return { ...result, byId: new Map(ids.map((id, i) => [id, result.offsets[i]])) };
	});

	return {
		register: () => nextId++,
		unregister(id) {
			sizes.delete(id);
		},
		setSize(id, size) {
			const prev = sizes.get(id);
			if (!prev || prev.width !== size.width || prev.height !== size.height || prev.align !== size.align) sizes.set(id, size);
		},
		offset: (id) => layout.byId.get(id) ?? { x: 0, y: 0 },
		get size() {
			return { width: layout.width, height: layout.height };
		},
	};
}

export function setStack(stack: Stack | undefined) {
	setContext(STACK, stack);
}

// For components that set up a different stack (or none) for part of their children.
export function getStack(): Stack | undefined {
	return getContext<Stack | undefined>(STACK);
}

// True when called inside a container that lays its children out.
export function inStack(): boolean {
	return !!getContext<Stack | undefined>(STACK);
}

// Call during component init, before setting a stack of your own.
// Returns a getter for this item's position within the parent stack (0,0 when not in one).
export function useSlot(size: () => Item): () => Position {
	const stack = getContext<Stack | undefined>(STACK);
	if (!stack) return () => ({ x: 0, y: 0 });
	const id = stack.register();
	$effect(() => {
		stack.setSize(id, size());
	});
	$effect(() => () => stack.unregister(id));
	return () => stack.offset(id);
}

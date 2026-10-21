// Toast queue, shared by every <Toaster> (render one in 2D, one in 3D, or both).
//   toaster.info('Player 2 joined');  toaster.negative('Connection lost', { duration: 0 });
import type { ToastKind } from './theme';

export type Toast = { id: number; kind: ToastKind; message: string };
export type ToastOptions = { kind?: ToastKind; duration?: number };

// ms before a toast hides itself; 0 keeps it until closed.
export const DEFAULT_TOAST_DURATION = 4000;

class Toaster {
	items = $state<Toast[]>([]);
	#nextId = 0;
	#timers = new Map<number, ReturnType<typeof setTimeout>>();

	show(message: string, { kind = 'info', duration = DEFAULT_TOAST_DURATION }: ToastOptions = {}): number {
		const id = this.#nextId++;
		this.items = [...this.items, { id, kind, message }];
		if (duration > 0) this.#timers.set(id, setTimeout(() => this.dismiss(id), duration));
		return id;
	}

	info = (message: string, options?: Omit<ToastOptions, 'kind'>) => this.show(message, { ...options, kind: 'info' });
	positive = (message: string, options?: Omit<ToastOptions, 'kind'>) => this.show(message, { ...options, kind: 'positive' });
	warning = (message: string, options?: Omit<ToastOptions, 'kind'>) => this.show(message, { ...options, kind: 'warning' });
	negative = (message: string, options?: Omit<ToastOptions, 'kind'>) => this.show(message, { ...options, kind: 'negative' });

	dismiss(id: number) {
		clearTimeout(this.#timers.get(id));
		this.#timers.delete(id);
		this.items = this.items.filter((toast) => toast.id !== id);
	}

	clear() {
		for (const timer of this.#timers.values()) clearTimeout(timer);
		this.#timers.clear();
		this.items = [];
	}
}

export const toaster = new Toaster();

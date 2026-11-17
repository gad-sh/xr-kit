// The live demos, by file name (src/demos/ButtonKinds.svelte → 'ButtonKinds').
import type { Component } from 'svelte';

const modules = import.meta.glob('../demos/*.svelte', { eager: true, import: 'default' }) as Record<string, Component>;

export const demos: Record<string, Component> = Object.fromEntries(
	Object.entries(modules).map(([path, component]) => [path.slice('../demos/'.length, -'.svelte'.length), component])
);

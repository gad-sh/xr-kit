// Which demo shows its 3D preview: one at a time, so the page has a single <a-scene>.
export const preview = $state<{ active: string | null }>({ active: null });

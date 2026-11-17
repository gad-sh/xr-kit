<script lang="ts">
	// Internal: a thin horizontal line in a 3D stack (menu dividers).
	import { getTheme } from './context';
	import { useSlot } from './layout.svelte';

	// width in meters; thickness and margin (above and below) in px.
	let { width, color, thickness = 1, margin = 6 }: { width: number; color: string; thickness?: number; margin?: number } = $props();

	const theme = getTheme();
	const m = (px: number) => px * theme().space3d.metersPerPx;
	const slot = useSlot(() => ({ width, height: m(thickness + 2 * margin) }));
</script>

<a-entity
	rounded="flat: true; width: {width}; height: {m(thickness)}; radius: 0; color: {color}"
	position="{slot().x - width / 2} {slot().y - m(thickness) / 2} 0.001"
></a-entity>

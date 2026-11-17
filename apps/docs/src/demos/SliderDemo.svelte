<script lang="ts">
	import { Slider, Stack } from '@xr-kit/ui';

	let volume = $state(60);
	let fog = $state(0.3);
</script>

<Stack direction="column" gap={20}>
	<Slider label="Volume" bind:value={volume} />
	<Slider label="Fog" bind:value={fog} min={0} max={1} step={0.05} />
</Stack>

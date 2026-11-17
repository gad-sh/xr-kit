<script lang="ts">
	import { Checkbox, Stack } from '@xr-kit/ui';

	let music = $state(true);
	let voice = $state(false);
</script>

<Stack direction="column" gap={12} align="start">
	<Checkbox label="Music" bind:checked={music} />
	<Checkbox type="toggle" label="Voice chat" bind:checked={voice} />
	<Checkbox label="Disabled" checked disabled />
</Stack>

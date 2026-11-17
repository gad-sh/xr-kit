<script lang="ts">
	import { Button, ButtonGroup, Stack, Text } from '@xr-kit/ui';

	let quality = $state(1);
	let channels = $state<number[]>([0]);
	const levels = ['Low', 'Medium', 'High'];
</script>

<Stack direction="column" gap={16}>
	<ButtonGroup mode="radio" bind:selected={quality} kind="secondary" size="compact">
		{#each levels as level (level)}
			<Button label={level} />
		{/each}
	</ButtonGroup>
	<ButtonGroup mode="checkbox" bind:selected={channels} kind="secondary" size="compact" shape="pill">
		<Button label="Music" />
		<Button label="Voice" />
		<Button label="Effects" />
	</ButtonGroup>
	<Text variant="LabelSmall" color="#AFAFAF" text="quality = {quality}, channels = [{channels.join(', ')}]" />
</Stack>

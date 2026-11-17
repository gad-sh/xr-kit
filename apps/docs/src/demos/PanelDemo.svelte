<script lang="ts">
	import { Button, Panel, Stack, Text } from '@xr-kit/ui';
</script>

<Stack gap={24} align="start">
	<Panel title="Settings" width={260}>
		{#snippet action()}
			<Button label="×" kind="tertiary" shape="circle" size="compact" />
		{/snippet}
		<Text align="left" text="A solid panel with an action." />
		<Button label="Save" size="compact" />
	</Panel>
	<Panel title="Glass" kind="glass" width={220}>
		<Text align="left" text="Glass refracts the world." />
	</Panel>
</Stack>

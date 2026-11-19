<script lang="ts">
	import { Button, Panel, Stack, Text } from '@xr-kit/ui';

	let open = $state(false);
</script>

<Stack gap={24} align="start">
	<Panel title="Settings" width={260}>
		{#snippet action()}
			<Button label="×" kind="tertiary" shape="circle" size="compact" />
		{/snippet}
		<Text align="left" text="A solid panel with an action." />
		<Button label="Save" size="compact" />
	</Panel>
	<Panel title="Folds" collapsible bind:open width={220}>
		{#snippet summary()}
			<Text align="left" variant="LabelSmall" text="Tap the title to open" />
		{/snippet}
		<Text align="left" text="The whole title row is the header." />
		<Button label="Done" size="compact" onclick={() => (open = false)} />
	</Panel>
	<Panel title="Glass" kind="glass" width={220}>
		<Text align="left" text="Glass refracts the world." />
	</Panel>
</Stack>

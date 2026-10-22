<script lang="ts">
	import { Checkbox, Panel, Slider, Stack, Tab, Tabs, Text } from '@gadxr/ui';

	let volume = $state(70);
	let sounds = $state(true);
	let notifications = $state(true);
	let email = $state(false);
</script>

<Stack direction="column" gap={24} align="start">
	<Text variant="HeadingMedium" text="Settings" />
	<Panel padding={16}>
		<Tabs>
			<Tab key="sound" title="Sound">
				<Stack direction="column" gap={16} align="start">
					<Checkbox type="toggle" label="Sounds" bind:checked={sounds} />
					<Slider label="Volume" bind:value={volume} showValue disabled={!sounds} width={280} />
				</Stack>
			</Tab>
			<Tab key="notifications" title="Notifications">
				<Stack direction="column" gap={16} align="start">
					<Checkbox type="toggle" label="Notifications" bind:checked={notifications} />
					<Checkbox label="Also by email" bind:checked={email} disabled={!notifications} />
				</Stack>
			</Tab>
		</Tabs>
	</Panel>
</Stack>

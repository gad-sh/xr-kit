<script lang="ts">
	import { Checkbox, Panel, Slider, Tab, Tabs, Text } from '@xr-kit/ui';

	let tab = $state('audio');
	let volume = $state(70);
</script>

<Panel width={320}>
	<Tabs bind:active={tab}>
		<Tab key="audio" title="Audio">
			<Slider label="Volume" bind:value={volume} />
		</Tab>
		<Tab key="video" title="Video">
			<Checkbox type="toggle" label="High quality" checked />
		</Tab>
		<Tab key="beta" title="Beta" disabled>
			<Text text="Not yet" />
		</Tab>
	</Tabs>
</Panel>

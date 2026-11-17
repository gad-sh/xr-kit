<script lang="ts">
	import { Button, Panel, Text } from '@xr-kit/ui';

	let clicks = $state(0);
</script>

<Panel title="Hello" align="center">
	<Text text={clicks ? `Clicked ${clicks} times` : 'The same markup, on a screen or in VR'} />
	<Button label="Click me" onclick={() => clicks++} />
</Panel>

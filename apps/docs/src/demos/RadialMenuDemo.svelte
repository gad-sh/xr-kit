<script lang="ts">
	import { Button, RadialMenu, Stack, Text } from '@xr-kit/ui';

	const reactions = [{ label: '👍' }, { label: '👋' }, { label: '🎉' }, { label: '❤️' }];
	let sent = $state('');
	let open = $state(false);
</script>

<Stack direction="column" gap={12}>
	<Text text={sent ? `You sent ${sent}` : 'Hold R anywhere on the page, aim, release'} />
	<Button label="Or open it here" kind="secondary" size="compact" onclick={() => (open = true)} />
</Stack>
<RadialMenu hotkey="r" items={reactions} bind:open onselect={(item) => (sent = item.label)} />

<script lang="ts">
	import { Button, Stack, Toaster, toaster } from '@xr-kit/ui';
</script>

<Stack gap={8}>
	<Button label="Info" size="compact" onclick={() => toaster.info('Player 2 joined')} />
	<Button label="Positive" size="compact" kind="secondary" onclick={() => toaster.positive('Saved')} />
	<Button label="Warning" size="compact" kind="secondary" onclick={() => toaster.warning('Battery low')} />
	<Button
		label="Negative"
		size="compact"
		kind="secondary"
		onclick={() => toaster.negative('Connection lost', { duration: 0 })}
	/>
</Stack>

<!-- One per page (2D: fixed to a corner of the window). -->
<Toaster />

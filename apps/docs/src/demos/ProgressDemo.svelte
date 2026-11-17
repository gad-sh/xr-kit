<script lang="ts">
	import { ProgressBar, Stack } from '@xr-kit/ui';
</script>

<Stack direction="column" gap={20}>
	<ProgressBar label="Downloading world" value={64} showValue />
	<ProgressBar label="Connecting" infinite size="small" />
</Stack>

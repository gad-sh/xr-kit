<script lang="ts">
	import { Button, Stack } from '@xr-kit/ui';
</script>

<Stack direction="column" gap={16}>
	<Stack gap={12}>
		<Button label="Mini" size="mini" />
		<Button label="Compact" size="compact" />
		<Button label="Default" />
		<Button label="Large" size="large" />
	</Stack>
	<Stack gap={12}>
		<Button label="Pill" shape="pill" kind="secondary" />
		<Button label="Round" shape="round" kind="secondary" />
		<Button label="+" shape="circle" kind="secondary" />
		<Button label="×" shape="square" kind="secondary" />
	</Stack>
</Stack>

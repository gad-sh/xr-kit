<script lang="ts">
	import { Avatar, Button, Stack, Tooltip } from '@xr-kit/ui';
</script>

<Stack gap={24}>
	<Tooltip content="Copies the invite link">
		<Button label="Invite" kind="secondary" />
	</Tooltip>
	<Tooltip content="Grace Hopper, online" placement="bottom">
		<Avatar name="Grace Hopper" status="online" />
	</Tooltip>
</Stack>

<script lang="ts">
	import { Button, Stack, Tag } from '@xr-kit/ui';
</script>

<Stack direction="column" gap={12} align="start">
	<Stack gap={8}>
		<Tag label="Row" kind="accent" />
		<Tag label="of" />
		<Tag label="tags" />
	</Stack>
	<Stack gap={8} alignSelf="end">
		<Button label="Cancel" kind="tertiary" size="compact" />
		<Button label="OK" size="compact" />
	</Stack>
</Stack>

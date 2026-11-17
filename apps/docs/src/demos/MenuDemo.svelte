<script lang="ts">
	import { Menu, Stack, Text } from '@xr-kit/ui';
	import type { MenuItem } from '@xr-kit/ui';

	const actions: MenuItem[] = [
		{ label: 'Wave', end: '1' },
		{ label: 'Dance', end: '2' },
		{ label: 'Sit', disabled: true },
		{ divider: true },
		{ label: 'Leave world' },
	];
	let picked = $state('');
	let quality = $state('Medium');
</script>

<Stack gap={24} align="start">
	<Stack direction="column" gap={8}>
		<Menu items={actions} onselect={(item) => (picked = item.label)} />
		<Text variant="LabelSmall" color="#AFAFAF" text={picked ? `Picked ${picked}` : 'Pick one'} />
	</Stack>
	<Menu items={[{ label: 'Low' }, { label: 'Medium' }, { label: 'High' }]} bind:selected={quality} width={160} />
</Stack>

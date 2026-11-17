<script lang="ts">
	import { Stack, Tag } from '@xr-kit/ui';
	import type { TagKind } from '@xr-kit/ui';

	const kinds: TagKind[] = ['neutral', 'accent', 'positive', 'warning', 'negative'];
</script>

<Stack direction="column" gap={10}>
	<Stack gap={8}>
		{#each kinds as kind (kind)}
			<Tag {kind} label={kind} />
		{/each}
	</Stack>
	<Stack gap={8}>
		{#each kinds as kind (kind)}
			<Tag {kind} variant="solid" size="medium" label={kind} />
		{/each}
	</Stack>
</Stack>

<script lang="ts">
	import { Button, Modal, Text, toaster } from '@xr-kit/ui';

	let open = $state(false);
</script>

<Button label="Leave world" kind="secondary" onclick={() => (open = true)} />

<Modal bind:open title="Leave world?">
	<Text align="left" maxWidth={360} text="Your progress is saved. You can come back any time." />
	{#snippet actions()}
		<Button label="Stay" kind="tertiary" onclick={() => (open = false)} />
		<Button
			label="Leave"
			onclick={() => {
				open = false;
				toaster.info('You left');
			}}
		/>
	{/snippet}
</Modal>

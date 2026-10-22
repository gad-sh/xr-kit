<script lang="ts">
	// A 2D page: the components render as plain HTML outside a <Scene3D>, no A-Frame needed.
	import { Button, ButtonGroup, Checkbox, Input, Modal, Panel, Stack, Text, toaster } from '@gadxr/ui';

	let name = $state('');
	let email = $state('');
	let newsletter = $state(true);
	let confirmDelete = $state(false);
	const emailError = $derived(email && !email.includes('@') ? 'That doesn’t look like an email address' : undefined);

	function save() {
		if (!name || emailError) return toaster.negative('Fill in your name and a valid email');
		toaster.positive(`Saved, ${name}`);
	}
</script>

<Stack direction="column" gap={24} align="start">
	<Text variant="HeadingMedium" text="Your profile" />
	<Panel title="Details" padding={16} gap={16} align="start">
		<Input label="Name" placeholder="Ada Lovelace" bind:value={name} />
		<Input label="Email" placeholder="ada@example.com" bind:value={email} error={emailError} />
		<Checkbox label="Send me the newsletter" bind:checked={newsletter} />
		<ButtonGroup gap={8}>
			<Button label="Save" onclick={save} />
			<Button label="Delete account" kind="secondary" onclick={() => (confirmDelete = true)} />
		</ButtonGroup>
	</Panel>
</Stack>

<Modal open={confirmDelete} title="Delete your account?" onclose={() => (confirmDelete = false)}>
	<Text text="This can’t be undone." />
	{#snippet actions()}
		<Button label="Cancel" kind="secondary" onclick={() => (confirmDelete = false)} />
		<Button
			label="Delete"
			onclick={() => {
				confirmDelete = false;
				toaster.info('Account deleted (not really)');
			}}
		/>
	{/snippet}
</Modal>

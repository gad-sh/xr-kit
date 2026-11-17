<script lang="ts">
	import { Input, Stack, toaster } from '@xr-kit/ui';

	let name = $state('');
	let age = $state('');
	const ageError = $derived(age && !/^\d+$/.test(age) ? 'Numbers only' : '');
</script>

<Stack direction="column" gap={16}>
	<Input label="Name" placeholder="Your name" caption="Shown to other players" maxLength={24} bind:value={name} />
	<Input
		label="Age"
		inputmode="numeric"
		enterkeyhint="done"
		error={ageError}
		bind:value={age}
		onsubmit={() => (ageError ? false : void toaster.positive('Saved'))}
	/>
</Stack>

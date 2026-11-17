<script lang="ts">
	import { Button, Stack, ThemeProvider, createTheme } from '@xr-kit/ui';

	const theme = createTheme({
		colors: {
			button: {
				primary: { fill: '#05944F', text: '#FFFFFF', hover: '#06A85A', active: '#047A41' },
				secondary: { fill: '#2B3150', hover: '#3A4266', active: '#4A5480' },
			},
		},
		borders: { buttonBorderRadius: 4 },
	});
</script>

<ThemeProvider {theme}>
	<Stack gap={12}>
		<Button label="Primary" />
		<Button label="Secondary" kind="secondary" />
	</Stack>
</ThemeProvider>

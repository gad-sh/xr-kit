<script lang="ts">
	// Inside the scene (vr/+layout.svelte), so these components render in 3D.
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button, ButtonGroup, Panel, Surface, Text, Toaster, toaster, xr } from '@gadxr/ui';
</script>

<!-- In front of the camera on desktop; follows your gaze in VR. -->
<Surface desktop="camera" offset="0 -0.2 -1" desktopScale={0.7} vr="follow">
	<Panel title="VR" padding={16} gap={12} align="center">
		<Text variant="LabelSmall" color="#AFAFAF" text={xr.presenting ? 'The trigger clicks' : 'Enter VR with the button at the bottom right'} />
		<ButtonGroup gap={8} size="compact">
			<Button label="Say hi" onclick={() => toaster.info('Hi!')} />
			<!-- Navigating out of vr/ removes the scene (and ends a VR session). -->
			<Button label="Back to the app" kind="secondary" onclick={() => goto(resolve('/'))} />
		</ButtonGroup>
	</Panel>
</Surface>
<Surface desktop="camera" offset="0.4 0.3 -1" vr="follow">
	<Toaster />
</Surface>

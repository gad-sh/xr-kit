<script lang="ts">
	// One page for a screen and a VR headset, showing each way to use @gadxr/ui.
	// Components render as HTML outside <Scene3D> and as 3D entities inside it; a <Surface>
	// switches between the two: HTML (or 3D) on a screen, 3D in a headset. On desktop,
	// press V to preview the VR layout without a headset.
	import {
		Button,
		ButtonGroup,
		Checkbox,
		Input,
		Keyboard,
		Panel,
		RadialMenu,
		RAYCASTABLE,
		Scene3D,
		Slider,
		Surface,
		Tag,
		Text,
		ThemeProvider,
		Toaster,
		createTheme,
		everyFrame,
		toaster,
		xr,
	} from '@gadxr/ui';

	// Optional: override design tokens (packages/ui/src/theme.ts); applies in 2D and 3D.
	const theme = createTheme({ colors: { button: { secondary: { fill: '#2B3150', hover: '#3A4266', active: '#4A5480' } } } });

	let menuOpen = $state(true);
	let name = $state('');
	const colors = ['#E11900', '#276EF1', '#05944F'];
	let color = $state(1);
	let spin = $state(true);
	let size = $state(50);
	const scale = $derived(0.5 + size / 100);

	// Per-frame code outside an A-Frame component: use everyFrame, not requestAnimationFrame,
	// which stops in a headset (frames come from the VR session). Here the box floats.
	let box = $state<HTMLElement & { object3D?: any }>();
	$effect(() => {
		if (!box) return;
		return everyFrame(box.closest('a-scene'), () => {
			box!.object3D.position.y = 1.2 + 0.1 * Math.sin(performance.now() / 600);
		});
	});

	const reactions = [{ label: '👍' }, { label: '👋' }, { label: '🎉' }, { label: '❤️' }];
	const react = (item: { label: string }) => toaster.info(`You sent ${item.label}`);

	function onkeydown(event: KeyboardEvent) {
		// Not while typing in an HTML field (a focused 3D Input keeps its keys to itself).
		if ((event.target as HTMLElement).closest?.('input, textarea')) return;
		if (event.repeat) return;
		if (event.key === 'v' || event.key === 'V') xr.simulated = !xr.simulated;
		if (event.key === 'm' || event.key === 'M') menuOpen = !menuOpen;
	}
</script>

<svelte:window {onkeydown} />

<ThemeProvider {theme}>
	<!-- Outside <Scene3D>, components are plain HTML (here over the canvas; not seen in VR). -->
	<div class="corner">
		<Checkbox type="toggle" label="Preview VR layout (V)" bind:checked={xr.simulated} />
	</div>

	<!-- Required: the <a-scene>. Components inside it render in 3D; it also sets up the mouse
	     cursor and the lasers, and loads troika-text for the labels. -->
	<Scene3D>
		<!-- Your world: any A-Frame markup. -->
		<a-sky color="#0b0e18"></a-sky>
		<a-entity light="type: ambient; intensity: 0.7"></a-entity>
		<a-entity light="type: directional; intensity: 1.5" position="2 4 3"></a-entity>
		<!-- `floor`: what you can teleport onto (blink-controls' collisionEntities). `bvh` (from
		     @gadxr/aframe-bvh) makes raycasts against an entity's meshes fast: these are a few triangles,
		     but a detailed model or terrain you teleport onto needs it (the arc casts ~15 rays a frame). -->
		<a-plane class="floor" bvh width="20" height="20" rotation="-90 0 0" color="#1d2335"></a-plane>
		<!-- Two platforms to teleport up onto: their tops are `floor` too. The sides are too
		     steep to land on (landingMaxAngle), so aiming at one turns the arc red. -->
		<a-box class="floor" bvh position="3.5 0.4 -5" width="2" height="0.8" depth="2" color="#2B3150"></a-box>
		<a-box class="floor" bvh position="-4 1.2 -8" width="2.5" height="2.4" depth="2.5" color="#3A4266"></a-box>

		<!-- Your own entities take clicks too: put the `raycastable` class on the one with the mesh. -->
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<a-box
			bind:this={box}
			class={RAYCASTABLE}
			position="-2 1.2 -3"
			width="0.5"
			height="0.5"
			depth="0.5"
			scale="{scale} {scale} {scale}"
			color={colors[color]}
			animation="property: rotation; to: 0 360 0; dur: 8000; loop: true; easing: linear; enabled: {spin}"
			onclick={() => toaster.info('You clicked the box')}
		></a-box>

		<a-entity id="rig">
			<!-- Required: a camera. Desktop `camera` Surfaces attach to it. -->
			<a-entity id="camera" camera look-controls wasd-controls position="0 1.6 0">
				<!-- 3D attached to the camera: toasts (toaster.*) stay in view, on desktop and in VR. -->
				<!-- <Toaster placement="top" position="0 0.3 -1" scale="0.4 0.4 0.4" /> -->
			</a-entity>
			<!-- For VR: laser-controls on the hands (Scene3D aims them at the UI); the trigger clicks. -->
			<!-- Controller buttons are events on the hand: Y (left) shows and hides the menu. -->
			<!-- Teleport on the left thumbstick: push forward to aim, release to jump; left/right turns.
			     It moves the whole rig, so the hands and `follow`/`hand` Surfaces come along. -->
			<a-entity
				id="leftHand"
				laser-controls="hand: left"
				blink-controls="cameraRig: #rig; teleportOrigin: #camera; collisionEntities: .floor"
				onybuttondown={() => (menuOpen = !menuOpen)}
			></a-entity>
			<a-entity id="rightHand" laser-controls="hand: right">
				<!-- VR: hold the right grip, aim with the thumbstick, release. -->
				<RadialMenu dimension="3d" controller="#rightHand" hand="right" openOn="gripdown" closeOn="gripup" items={reactions} onselect={react} />
			</a-entity>
		</a-entity>

		<!-- Surfaces go in the scene, not under the camera. -->

		<!-- 3D on desktop too, in front of the camera; follows your gaze in VR.
		     `open` slides it in and out: M on desktop, Y on the left controller. -->
		<Surface desktop="camera" offset="0 -0.3 -1" desktopScale={0.7} vr="follow" open={menuOpen}>
			<Panel title="Hello" padding={16} gap={12} align="center">
				<ButtonGroup gap={8} size="compact">
					<Button label="Info" onclick={() => toaster.info('Something happened')} />
					<Button label="Yes" kind="secondary" onclick={() => toaster.positive('That worked')} />
					<Button label="No" kind="secondary" onclick={() => toaster.negative('That failed')} />
				</ButtonGroup>
				<!-- A 3D field: typed into with the keyboard on desktop, the VR <Keyboard> in a headset. -->
				<Input
					label="Your name"
					placeholder="Type here"
					enterkeyhint="done"
					maxLength={24}
					bind:value={name}
					onsubmit={(value) => {
						toaster.info(value ? `Hi, ${value}` : 'Hi');
					}}
				/>
				<Text variant="LabelSmall" color="#AFAFAF" text={xr.presenting ? 'Left stick teleports · trigger clicks · grip: reactions · Y hides' : 'Hold E for reactions · M hides'} />
			</Panel>
		</Surface>

		<!-- HTML on desktop (on the right of the screen); stands here in the world in VR. -->
		<Surface screen="right" vr="world" position="1.3 1.5 -1.2" rotation="0 -35 0">
			<Panel title="Welcome" width={300}>
				<Text
					variant="ParagraphMedium"
					align="left"
					maxWidth={252}
					color="#CBCBCB"
					text="This panel is a Surface: HTML on a screen, standing in the world in a headset."
				/>
				<Tag kind={xr.immersive ? 'accent' : 'neutral'} variant="solid" label={xr.presenting ? 'In VR' : xr.simulated ? 'VR preview' : 'Screen'} />
			</Panel>
		</Surface>

		<!-- HTML on desktop (top left of the screen); on your left wrist in VR. -->
		<Surface screen="top-left" vr="hand" hand="#leftHand">
			<Panel title="Box" padding={16} gap={12}>
				<ButtonGroup mode="radio" bind:selected={color} size="compact" kind="secondary" gap={8}>
					<Button label="Red" />
					<Button label="Blue" />
					<Button label="Green" />
				</ButtonGroup>
				<Checkbox type="toggle" label="Spin" bind:checked={spin} />
				<Slider label="Size" bind:value={size} width={200} />
			</Panel>
		</Surface>
		
		<!-- HTML on desktop (bottom right of the screen); in VR up and to the right of your view. -->
		<Surface screen="bottom-right" vr="follow" side={0.5} height={0.05} distance={1.3}>
			<Toaster placement="bottom-right" />
		</Surface>

		<!-- For VR typing: opens while a 3D field has focus in a headset (or the VR preview). -->
		<Keyboard />
	</Scene3D>

	<!-- Desktop: hold E, aim with the mouse, release. HTML, outside the scene. -->
	<RadialMenu hotkey="e" items={reactions} onselect={react} disabled={xr.presenting} />
</ThemeProvider>

<style>
	.corner {
		position: fixed;
		top: 16px;
		right: 16px;
		z-index: 10;
	}
</style>

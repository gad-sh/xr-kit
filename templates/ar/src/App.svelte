<script lang="ts">
	// An AR page for a Quest: press AR and a small solar system floats in your room. Hold the
	// trigger to aim at a table or the floor (A-Frame's `ar-hit-test` shows where), release to
	// put it there. Its controls are on your left wrist, as a Surface: HTML on a screen.
	import { Button, Checkbox, Panel, RAYCASTABLE, Scene3D, Slider, Surface, Text, Toaster, toaster, xr } from '@gadxr/ui';

	let orbit = $state(true);
	let size = $state(50);
	const scale = $derived(0.5 + size / 100);

	// Whether this browser can start an AR session (a Quest can; a desktop browser can't).
	let arSupported = $state(false);
	// (TypeScript's DOM types have no WebXR, hence the casts.)
	(navigator as any).xr?.isSessionSupported('immersive-ar').then((supported: boolean) => (arSupported = supported));

	let model = $state<HTMLElement & { object3D?: any }>();
	let camera = $state<HTMLElement & { object3D?: any }>();
	let leftHand = $state<HTMLElement & { components?: any }>();
	let rightHand = $state<HTMLElement & { components?: any }>();

	// The WebXR input source (a controller) of a press.
	type InputSource = { handedness: 'left' | 'right' | 'none' };

	// The trigger both clicks the UI and places the model (ar-hit-test hears every press).
	// A press that starts or ends with that hand's laser on something `.raycastable` is a click.
	const onUI = (source: InputSource) => {
		const hand = source.handedness === 'left' ? leftHand : rightHand;
		return !!hand?.components?.raycaster?.intersections.length;
	};
	const clicks = new WeakSet<InputSource>();

	type HitEvent = CustomEvent<{ inputSource: InputSource; position: any }>;
	function onselectstart(event: Event) {
		const { inputSource } = (event as HitEvent).detail;
		if (onUI(inputSource)) clicks.add(inputSource);
		else clicks.delete(inputSource);
	}
	function onselect(event: Event) {
		const { inputSource, position } = (event as HitEvent).detail;
		if (clicks.has(inputSource) || onUI(inputSource)) return;
		model!.object3D.position.copy(position);
		faceCamera();
		toaster.positive('Placed');
	}

	// Turn the model to face you (about the vertical axis only, so it stays level).
	function faceCamera() {
		const { position, rotation } = model!.object3D;
		const head = camera!.object3D.getWorldPosition(position.clone());
		rotation.set(0, Math.atan2(head.x - position.x, head.z - position.z), 0);
	}

	// Put it back 0.7 m in front of you, a bit below your eyes.
	function bringHere() {
		const head = camera!.object3D;
		const position = head.getWorldPosition(model!.object3D.position);
		const back = head.getWorldDirection(position.clone()).setY(0).normalize();
		position.addScaledVector(back, -0.7);
		position.y -= 0.4;
		faceCamera();
	}

	const help = $derived(
		xr.presenting
			? 'Hold the trigger on a table or the floor, release to place it'
			: arSupported
				? 'Press AR at the bottom right'
				: 'Open this page on a Quest and press AR',
	);
</script>

<!-- Required: the <a-scene>, here with only the AR button (`xr-mode-ui`). `ar-hit-test` shows
     where a ray from the controller (or your head) meets a real surface, while the trigger is
     held; Quest finds tables, walls and the floor from the room's Space Setup. -->
<Scene3D
	xr-mode-ui="XRMode: ar"
	webxr="optionalFeatures: hit-test, anchors"
	ar-hit-test="type: map; mapSize: 0.3 0.3"
	onar-hit-test-select-start={onselectstart}
	onar-hit-test-select={onselect}
>
	<!-- The desktop backdrop. `hide-on-enter-ar` hides it in AR, so you see your room. -->
	<a-sky color="#0b0e18" hide-on-enter-ar></a-sky>
	<a-plane hide-on-enter-ar width="20" height="20" rotation="-90 0 0" color="#1d2335"></a-plane>
	<a-entity light="type: ambient; intensity: 0.8"></a-entity>
	<a-entity light="type: directional; intensity: 1.2" position="1 3 2"></a-entity>

	<!-- What you place. Its origin is the bottom, so it sits on the surface you aim at. -->
	<a-entity bind:this={model} position="0 0.9 -1">
		<a-entity position="0 0.2 0" scale="{scale} {scale} {scale}">
			<!-- Your own entities take clicks too: put the `raycastable` class on the one with the mesh. -->
			<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
			<a-sphere
				class={RAYCASTABLE}
				radius="0.06"
				material="color: #FFC043; emissive: #FFC043; emissiveIntensity: 0.6"
				onclick={() => toaster.info('That’s the sun')}
			></a-sphere>
			<a-entity animation="property: rotation; to: 0 360 0; dur: 6000; loop: true; easing: linear; enabled: {orbit}">
				<a-sphere position="0.12 0 0" radius="0.015" color="#276EF1"></a-sphere>
			</a-entity>
			<a-entity rotation="0 120 0" animation="property: rotation; from: 0 120 0; to: 0 480 0; dur: 14000; loop: true; easing: linear; enabled: {orbit}">
				<a-sphere position="0.2 0 0" radius="0.025" color="#E11900"></a-sphere>
			</a-entity>
		</a-entity>
	</a-entity>

	<a-entity id="rig">
		<!-- Required: a camera. In AR it follows the headset, from the real floor. -->
		<a-entity bind:this={camera} id="camera" camera look-controls wasd-controls position="0 1.6 0"></a-entity>
		<!-- laser-controls on the hands (Scene3D aims them at the UI); the trigger clicks. -->
		<a-entity bind:this={leftHand} id="leftHand" laser-controls="hand: left"></a-entity>
		<a-entity bind:this={rightHand} id="rightHand" laser-controls="hand: right"></a-entity>
	</a-entity>

	<!-- Surfaces go in the scene, not under the camera. -->

	<!-- HTML on desktop (top left of the screen); on your left wrist in AR, out of the way of the room. -->
	<Surface screen="top-left" vr="hand" hand="#leftHand">
		<Panel title="Solar system" padding={16} gap={12}>
			<Checkbox type="toggle" label="Orbit" bind:checked={orbit} />
			<Slider label="Size" bind:value={size} width={200} />
			<Button label="Bring it here" kind="secondary" size="compact" onclick={bringHere} />
			<Text variant="LabelSmall" color="#AFAFAF" maxWidth={200} text={help} />
		</Panel>
	</Surface>

	<!-- HTML on desktop (bottom right of the screen); in AR up and to the right of your view. -->
	<Surface screen="bottom-right" vr="follow" side={0.5} height={0.05} distance={1.3}>
		<Toaster placement="bottom-right" />
	</Surface>
</Scene3D>

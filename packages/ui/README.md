# @gadxr/ui

Svelte 5 components for WebXR pages: the same markup renders as HTML on a screen, or as
A-Frame entities in 3D and in a VR headset. Buttons, panels, inputs with a VR keyboard,
tabs, menus, a radial menu, modals, toasts and more.

**[See every component in 2D and 3D](https://gad-sh.github.io/xr-kit/)**

```sh
pnpm add @gadxr/ui aframe
```

It needs Vite with `@sveltejs/vite-plugin-svelte`, Svelte 5 and A-Frame 1.8. A headset
only offers Enter VR on https, so serve the dev server over https (e.g. `vite-plugin-mkcert`).

## Use it

Load A-Frame first: the library reads the `AFRAME` and `THREE` globals it defines.

```ts
// main.ts
import 'aframe';
import { mount } from 'svelte';
import App from './App.svelte';

mount(App, { target: document.getElementById('app')! });
```

Components inside `<Scene3D>` render in 3D; outside it they're HTML. A `Surface` places UI
in the world, and can switch it between the screen and VR.

```svelte
<!-- App.svelte -->
<script lang="ts">
	import { Button, Panel, Scene3D, Surface, Toaster, toaster } from '@gadxr/ui';
</script>

<Scene3D>
	<a-sky color="#0b0e18"></a-sky>
	<a-entity id="rig">
		<a-entity camera look-controls wasd-controls position="0 1.6 0"></a-entity>
		<!-- The lasers click the UI in VR (the trigger). -->
		<a-entity laser-controls="hand: left"></a-entity>
		<a-entity laser-controls="hand: right"></a-entity>
	</a-entity>

	<!-- In front of the camera on desktop; follows your gaze in VR. -->
	<Surface desktop="camera" offset="0 -0.3 -1" vr="follow">
		<Panel title="Hello" padding={16}>
			<Button label="Say hi" onclick={() => toaster.info('Hi!')} />
		</Panel>
	</Surface>
	<Surface desktop="camera" offset="0.4 0.3 -1" vr="follow">
		<Toaster />
	</Surface>
</Scene3D>
```

The [starter app](https://github.com/gad-sh/xr-kit/tree/main/templates/starter) shows the
rest: HTML on a screen and 3D in VR from one `Surface`, theming, the VR keyboard, controller
buttons, teleport and per-frame code that keeps running in a headset.

Teleport and fast raycasts against big meshes are separate packages:
[`@gadxr/aframe-blink-controls`](https://www.npmjs.com/package/@gadxr/aframe-blink-controls)
and [`@gadxr/aframe-bvh`](https://www.npmjs.com/package/@gadxr/aframe-bvh).

## License

MIT. The bundled Geist font is under the SIL Open Font License (`dist/assets/Geist-OFL.txt`).

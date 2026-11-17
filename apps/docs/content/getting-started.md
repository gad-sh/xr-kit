---
title: Getting started
description: Start a new project from a template, or add the kit to an existing Vite + Svelte app.
---

## Requirements

- **Vite** with `@sveltejs/vite-plugin-svelte` (SvelteKit works too), and **Svelte 5**.
- **A-Frame 1.8**, loaded before the library: the library reads the `AFRAME` and `THREE` globals it defines and never imports A-Frame itself.
- **https** in development, if you want to try it on a headset: a headset's browser only offers Enter VR on a secure page. The templates use `vite-plugin-mkcert`.

## Start a new project

Copy a template with [degit](https://github.com/Rich-Harris/degit) (it downloads the folder without the kit's git history), then install and run it:

```sh
npx degit gad-sh/xr-kit/templates/starter my-app
cd my-app
pnpm install
pnpm dev
```

There are two [templates](/templates):

- **`starter`**: one page for a screen and a VR headset, with a scene, laser hands, teleport, and every way to place UI. Start here for a VR-first app.
- **`spa`** (`npx degit gad-sh/xr-kit/templates/spa my-app`): a mostly-2D SvelteKit app with HTML pages, and a VR section that loads A-Frame only when it's opened.

A copy installs the packages from npm, and works with npm as well as pnpm. Change the `name` in its `package.json`, and its LICENSE if your project uses another one.

## Add it to an existing project

Install the library and A-Frame, plus the A-Frame packages you use:

```sh
pnpm add @xr-kit/ui aframe
pnpm add @xr-kit/aframe-blink-controls  # teleport
pnpm add @xr-kit/aframe-tap-to-move     # tap the floor to move
pnpm add @xr-kit/aframe-bvh             # fast raycasts against big meshes
```

Import A-Frame first, so its globals exist before anything else runs:

```ts
// main.ts
import 'aframe';
import '@xr-kit/aframe-blink-controls'; // only if you use teleport
import '@xr-kit/aframe-tap-to-move';    // only if you use tap to move
import '@xr-kit/aframe-bvh';            // only if you use bvh
import { mount } from 'svelte';
import App from './App.svelte';

mount(App, { target: document.getElementById('app')! });
```

Then build the page. Components outside `<Scene3D>` are HTML; inside it they're 3D. A `Surface` switches between the two.

```svelte
<!-- App.svelte -->
<script lang="ts">
  import { Button, Keyboard, Panel, Scene3D, Surface, Toaster, toaster } from '@xr-kit/ui';
</script>

<Scene3D>
  <a-sky color="#0b0e18"></a-sky>
  <a-entity id="rig">
    <a-entity id="camera" camera look-controls wasd-controls position="0 1.6 0"></a-entity>
    <!-- The lasers click the UI in VR (the trigger). -->
    <a-entity id="leftHand" laser-controls="hand: left"></a-entity>
    <a-entity id="rightHand" laser-controls="hand: right"></a-entity>
  </a-entity>

  <!-- In front of the camera on desktop; follows your gaze in VR. -->
  <Surface desktop="camera" offset="0 -0.3 -1" vr="follow">
    <Panel title="Hello" padding={16}>
      <Button label="Say hi" onclick={() => toaster.info('Hi!')} />
    </Panel>
  </Surface>

  <!-- HTML in the bottom right corner on a screen; follows your gaze in VR. -->
  <Surface screen="bottom-right" vr="follow" side={0.5}>
    <Toaster />
  </Surface>

  <!-- The VR keyboard, for 3D text fields. -->
  <Keyboard />
</Scene3D>
```

### What the page provides

- **A-Frame, before the library.** Either `import 'aframe'` first (npm A-Frame sets the globals), or a `<script>` tag for A-Frame in `index.html`, before the app. Not both: that loads a second three.js. With a script tag and `@xr-kit/aframe-bvh`, also see [One three.js](/reference/bvh#one-threejs).
- **`svelte` and `aframe` as dependencies**: they're the library's peer dependencies.
- **A camera** in the scene. Surfaces with `desktop="camera"` attach to it (`[camera]` by default).
- **`laser-controls` on the hands**, for VR. `Scene3D` points their raycasters at the UI.

Everything else is the library's job: `Scene3D` sets up the mouse cursor and the lasers, takes the mouse cursor away during a VR session, and loads `troika-text` (the 3D labels) from unpkg if the page hasn't.

### TypeScript

A-Frame ships no types. If your project is `strict` and imports `aframe`, declare the module:

```ts
// src/aframe.d.ts
declare module 'aframe';
```

## Open it on a headset

The dev server's certificate comes from mkcert, whose root certificate is only trusted on your computer, so the headset's browser warns about it: continue past the warning.

**Over USB (Quest):** with the headset in developer mode and plugged in, forward the port, then open `https://localhost:5173` in the headset's browser:

```sh
adb reverse tcp:5173 tcp:5173
```

**Over Wi-Fi:** start the dev server with `--host` and open the network address Vite prints from a headset on the same network.

Then press the VR button at the bottom right of the page. There's no console in the headset: over USB, open `chrome://inspect` in Chrome on your computer to see the page's console.

Without a headset, set [`xr.simulated`](/reference/api#xr) to preview the VR layout on desktop (the starter toggles it with V), and see [Testing](/guides/testing) for an emulated headset.

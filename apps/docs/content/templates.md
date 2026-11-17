---
title: Templates
description: Two apps to copy with degit, starter (VR-first, one page) and spa (mostly 2D, SvelteKit), and what each shows.
---

Both templates install the packages from npm, work with npm or pnpm, and serve over https in development (`vite-plugin-mkcert`). Their `pnpm-workspace.yaml` lets pnpm 11 install A-Frame 1.8, which pulls one of its own dependencies from git.

## starter

```sh
npx degit gad-sh/xr-kit/templates/starter my-app
```

One page for a screen and a VR headset, showing each way to use the library. `src/App.svelte` is the whole app.

| Where it is | On a screen | In a headset |
| --- | --- | --- |
| Menu `Surface` (`desktop="camera" vr="follow"`): Buttons that call `toaster.*`, an `Input` | 3D, in front of the camera | 3D, following your gaze |
| Welcome `Surface` (`screen="right" vr="world"`) | HTML, right of the screen | 3D, standing in the world |
| Box `Surface` (`screen="top-left" vr="hand"`): a radio `ButtonGroup`, a toggle and a `Slider` that change a box in the scene | HTML, top left | 3D, on your left wrist |
| "Preview VR layout" toggle, outside the scene | HTML | (not shown) |
| Menu `open` (slides it in and out) | M | Y on the left controller |
| Moving around | Tap or click the floor ([`tap-to-move`](/reference/tap-to-move) on the rig) to glide there; WASD and dragging to look | Pick in the menu: Teleport ([`blink-controls`](/reference/teleport), left thumbstick: forward to aim, release to jump; left/right turns), or Tap to move (point a laser at the floor and pull the trigger to jump there) |
| Reactions `RadialMenu` | HTML: hold E, aim with the mouse, release | 3D on the right controller: hold grip, aim with the thumbstick, release |
| `<Toaster />` in a `Surface` (`screen="bottom-right" vr="follow"`) | HTML, bottom right | 3D, following your gaze, up and to the right |
| `<Keyboard />` | (a 3D field takes the physical keyboard) | 3D, opens while a field has focus |

It also shows a camera rig with two `laser-controls` hands, teleport and tap to move onto a floor and two platforms (with [`bvh`](/reference/bvh) for fast raycasts), an entity of your own taking clicks (`RAYCASTABLE`), controller buttons as events on the hand (`onybuttondown`), [`everyFrame`](/guides/frame-loop) for per-frame code, `xr.simulated` (press V to preview the VR layout), and a theme override with `createTheme`.

## spa

```sh
npx degit gad-sh/xr-kit/templates/spa my-app
```

A mostly-2D single page app with SvelteKit, whose pages are HTML and where some parts open in a headset.

| Route | What it is |
| --- | --- |
| `src/routes/+layout.svelte` | The shell for every route: `ThemeProvider`, the navigation, the 2D `<Toaster />` |
| `/` | A form in a `Panel`: `Input`s (one with an `error`), a `Checkbox`, `Button`s, `toaster.*`, a `Modal` to confirm |
| `/settings` | `Tabs` with toggles and a `Slider` |
| `/vr` | The scene: a `Surface` in front of the camera (following your gaze in VR) and a 3D `Toaster` |

- **It renders in the browser only** (`ssr = false` in `src/routes/+layout.ts`) and builds to static files with `adapter-static`, with `index.html` as the fallback for every path.
- **The 2D routes don't load A-Frame.** Outside a `<Scene3D>` the components are plain HTML, and the library only reads the `AFRAME` global when a 3D component mounts. `vr/+layout.svelte` imports A-Frame (with three.js, over 1 MB) when you open the VR section:

```svelte
<!-- src/routes/vr/+layout.svelte -->
<script lang="ts">
  import { Scene3D } from '@xr-kit/ui';
  let { children } = $props();
  const aframe = import('aframe');
</script>

{#await aframe}
  <p>Loading the scene…</p>
{:then}
  <Scene3D>
    <!-- sky, lights, camera rig with laser-controls hands -->
    {@render children()}
  </Scene3D>
{/await}
```

- **The routes under `vr/` share one scene.** Going between them swaps their Surfaces without rebuilding the scene, so a VR session carries on. Leaving `vr/` removes the scene, which ends the session.

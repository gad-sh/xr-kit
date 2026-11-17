---
title: Testing without a headset
description: Checking a xr-kit page on desktop and headlessly — simulated VR, a faked XR session, and an emulated Quest 3 with IWER — and what still needs a real headset.
---

Real VR can't be tested headlessly. What you can check without a headset gets you most of the way; say what you verified and what still needs a headset.

## Type check and build

Run `svelte-check` and `vite build`. Both templates have them as `pnpm check` and `pnpm build`.

## Preview the VR layout on desktop

Set `xr.simulated = true` and every [Surface](/guides/surfaces) switches to its `vr` placement, the [VR keyboard](/components/keyboard) opens for 3D fields, and you can click it all with the mouse. `hand` Surfaces follow instead, since there are no controllers. The starter toggles it with V:

```svelte
<script lang="ts">
  import { Checkbox, xr } from '@xr-kit/ui';
</script>

<Checkbox type="toggle" label="Preview VR layout" bind:checked={xr.simulated} />
```

## Fake a real session (headless)

`xr.simulated` doesn't go through A-Frame's enter-VR path. To exercise code that waits for a real session (`xr.presenting`, the mouse cursor being removed, `everyFrame` switching loops), fake one from the page:

```js
const scene = document.querySelector('a-scene');
scene.xrSession = { requestAnimationFrame: (cb) => requestAnimationFrame(cb), cancelAnimationFrame: (id) => cancelAnimationFrame(id) };
scene.states.push('vr-mode');
scene.emit('enter-vr');
```

## Emulate a Quest 3 with IWER

[IWER](https://github.com/meta-quest/immersive-web-emulation-runtime) is a WebXR runtime in JavaScript. It lets a headless browser run A-Frame's real enter-VR path, with controller models and lasers; screenshots show the headset view.

1. Load IWER's browser build (`https://unpkg.com/iwer@2.5.0/build/iwer.min.js`) before the page's own scripts (e.g. as an init script in your browser automation tool), followed by:

   ```js
   new IWER.XRDevice(IWER.metaQuest3).installRuntime({ forceInstall: true });
   ```

   Headless Chrome has its own (empty) WebXR runtime, so `forceInstall` is needed.
2. Enter VR: `document.querySelector('a-scene').enterVR()`.
3. To mimic the Quest pausing the page's `requestAnimationFrame` in VR, wrap it so it only passes on callbacks named `onDeviceFrame` (IWER's frame loop) and **holds** the others, running them on `exit-vr`. Dropping them instead kills A-Frame's render loop after exit.

### Aiming a controller

Set `device.controllers.right.quaternion` so the hand's raycaster (`raycaster.data.origin` / `direction`, in hand space) points at the target. A-Frame tracks the grip pose, which IWER offsets from the pose you set, so take the offset from the current poses (`G = inverse(iwerQuat) * handWorldQuat`, then set `R * inverse(G)`), re-aim over a few frames, and check `raycaster.intersections`. Then `controller.updateButtonValue('trigger', 1)` and `0` clicks.

## Traps

- **Headless rendering is slow** (seconds per frame for a full scene). Wait several seconds after a synthetic `mousemove` before checking hover.
- **Toasts last 4 s** (`DEFAULT_TOAST_DURATION`), less than a few slow frames. Check `toaster.items` right after the click, or a working click looks like a failed one.
- **Don't send key presses through the browser's input pipeline** (`press`, CDP `Input.dispatchKeyEvent`) for shortcuts: on macOS one press can turn into thousands of repeated keydowns, so a toggle flips endlessly and the page stops answering. Dispatch `KeyboardEvent`s on `document.body` instead, with `code` set (A-Frame's `wasd-controls` reads it).
- **`requestAnimationFrame` keeps running** in every desktop and headless test, so code that would freeze in a headset passes. Use [`everyFrame`](/guides/frame-loop), or the rAF wrapper above.

## What needs a headset

Comfort and scale (is the text big enough, is the panel at a good distance), the feel of `follow` and `hand` placement, controller ergonomics, and performance on the device. Over USB, `chrome://inspect` on your computer shows the headset page's console.

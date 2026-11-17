---
title: Scene3D
description: Renders the <a-scene> and sets it up for the design system — 3D children, mouse cursor and lasers aimed at the UI, troika-text loading, XR state.
---

```svelte
<script lang="ts">
  import { Scene3D } from '@xr-kit/ui';
</script>

<Scene3D>
  <a-sky color="#0b0e18"></a-sky>
  <a-entity id="rig">
    <a-entity id="camera" camera look-controls wasd-controls position="0 1.6 0"></a-entity>
    <a-entity id="leftHand" laser-controls="hand: left"></a-entity>
    <a-entity id="rightHand" laser-controls="hand: right"></a-entity>
  </a-entity>
  <!-- Surfaces and 3D components -->
</Scene3D>
```

What it does:

- Renders an `<a-scene>`. Other attributes and `on…` handlers go on it: `<Scene3D embedded onenter-vr={…}>`.
- Children render in **3D**.
- Sets the scene's **mouse cursor** (`cursor`) and its raycaster (`objects: .raycastable`).
- Points the raycaster of every **`laser-controls`** entity at `.raycastable`, once it has loaded, keeping the rest of its raycaster. Hands mounted later are found too.
- **Removes the mouse cursor during an immersive session** and restores it on exit, unless `mouseCursorInVR` ([why](/guides/interaction#the-mouse-cursor-in-vr)).
- Adds a **tap cursor** during any XR session (`rayOrigin: xrselect; hand: none`), so a screen tap on a phone in AR, or a Cardboard's button, clicks the UI. Controllers have a hand, so they stay with their lasers; so do Vision Pro's transient pointers.
- **Points the mouse cursor's ray away when the last finger lifts** off the canvas, so the button you tapped doesn't stay hovered.
- Keeps [`xr.presenting`](/reference/api#xr) in step with the headset.
- Loads the pinned **troika-text** script (3D labels) before rendering the scene, if the page didn't load it. If it fails to load, the scene still shows, without labels, and the console says why.

One `<Scene3D>` per page. To keep a VR session going across routes (SvelteKit), render it in a layout, as the [spa template](/templates#spa) does.

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `cursor` | `string` | `MOUSE_CURSOR` (`'rayOrigin: mouse; fuse: false'`) | The scene's cursor, restored after VR |
| `raycaster` | `string` | `'objects: .raycastable'` | The scene cursor's raycaster |
| `mouseCursorInVR` | `boolean` | `false` | Keep the mouse cursor in an immersive session |
| `children` | `Snippet` | | |
| …rest | | | Attributes and handlers on the `<a-scene>` |

## Space3D

`<Space3D>` only sets the dimension to 3D for its children and renders nothing. Use it inside an `<a-scene>` you render yourself. It doesn't set up cursors or load troika-text: do both yourself (see [Gotchas](/guides/gotchas)).

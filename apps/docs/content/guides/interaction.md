---
title: Interaction
description: How clicks and hovers reach 3D components and your own entities, with the mouse on desktop and controller lasers in VR.
---

## Cursors

[`Scene3D`](/components/scene3d) sets up these cursors, and both only hit entities with the **`raycastable`** class:

- **The mouse cursor**, on the `<a-scene>` (`cursor="rayOrigin: mouse; fuse: false"`). It's removed during an immersive session and restored after (see below).
- **Controller lasers**: every entity with `laser-controls` gets `raycaster.objects: .raycastable`, once it has loaded, keeping the rest of its raycaster (its `far`, etc.). Hands mounted later (inside an `{#if}`) are picked up too. The trigger clicks.
- **Taps**: on a phone, touches click through the mouse cursor (once the finger lifts, nothing stays hovered). In an AR session, a tap cursor clicks where you tap the screen.

So your scene needs `laser-controls` on the hands, and nothing more:

```svelte
<a-entity id="rig">
  <a-entity id="camera" camera look-controls wasd-controls position="0 1.6 0"></a-entity>
  <a-entity id="leftHand" laser-controls="hand: left"></a-entity>
  <a-entity id="rightHand" laser-controls="hand: right"></a-entity>
</a-entity>
```

## Your own clickable entities

Give the entity that **owns the mesh** the `raycastable` class (exported as `RAYCASTABLE`), and handle `onclick`:

```svelte
<script lang="ts">
  import { RAYCASTABLE, toaster } from '@xr-kit/ui';
</script>

<a-box class={RAYCASTABLE} position="-2 1.2 -3" onclick={() => toaster.info('You clicked the box')}></a-box>
```

- A wrapper entity with no mesh never gets hit; the raycaster tests the meshes set directly on matching entities.
- The raycaster ignores `visible`. An invisible plane (`geometry` + `material="visible: false"`) is a fine hit area; to make something unclickable, remove the class.
- `mouseenter` / `mouseleave` / `mousedown` / `mouseup` / `click` are emitted on the hit entity, with `detail.cursorEl` and `detail.intersection`.

## Controller buttons

Controller buttons are events on the hand entity: `triggerdown`, `gripdown`, `abuttondown`, `bbuttondown`, `xbuttondown`, `ybuttondown` (and their `…up`), `thumbstickmoved`. Svelte's `on…` attributes listen to them directly:

```svelte
<a-entity laser-controls="hand: left" onybuttondown={() => (menuOpen = !menuOpen)}></a-entity>
```

## The mouse cursor in VR

The mouse cursor on the scene also hears every laser's intersection events (they bubble to the scene), and keeps casting along its last mouse ray. Left alone in VR, its `mouseleave`s would turn off hover on a button a laser is still pointing at. So `Scene3D` removes it during an immersive session (switching its raycaster off first, which sends the leaves) and restores it on exit. Pass `mouseCursorInVR` to keep it, e.g. for a demo that also runs in simulated VR.

## Keyboard and key shortcuts

While a 3D [`Input`](/components/input) has focus, it takes every key except Cmd/Ctrl shortcuts (in the capture phase), so a page's own shortcuts and WASD don't fire while typing. It also swallows the matching keyups, because A-Frame acts on keyup (F → fullscreen). If your page has shortcuts, skip them while an HTML field has focus:

```ts
function onkeydown(event: KeyboardEvent) {
  if ((event.target as HTMLElement).closest?.('input, textarea')) return;
  if (event.key === 'm') menuOpen = !menuOpen;
}
```

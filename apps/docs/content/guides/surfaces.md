---
title: Surfaces
description: Surface is the unit that switches between a screen and VR. Where it puts its content on desktop, where it puts it in a headset, and how to open and close it.
---

A [`Surface`](/components/surface) holds a piece of UI and decides where it goes: in a region of the screen as HTML, in front of the desktop camera as 3D, or, in a headset, in the world, following your gaze, or on your wrist. It's the "responsive" unit of a page that works on a screen and in VR.

```svelte
<Scene3D>
  <!-- HTML at the bottom of the screen; follows your gaze in VR. -->
  <Surface screen="bottom" vr="follow">
    <Panel title="Inventory">…</Panel>
  </Surface>
</Scene3D>
```

**Put Surfaces inside the `<a-scene>`, not under the camera.** They work in world space and place themselves.

## Two modes

A Surface is in one of two modes, from [`xr.immersive`](/reference/api#xr):

- **Not immersive** (a screen): placed by `desktop`.
- **Immersive** (a real XR session, or `xr.simulated`): placed by `vr`, always 3D.

`enter-vr` without an XR session (A-Frame's fullscreen on desktop) doesn't count as immersive.

### On a screen: `desktop`

| `desktop` | What happens |
| --- | --- |
| `screen` (default) | HTML, in a fixed region of the window: `screen` = `top-left`, `top`, `top-right`, `left`, `center`, `right`, `bottom-left`, `bottom` (default), `bottom-right`. Surfaces in the same region stack. Or `target`: a CSS selector to render into instead |
| `camera` | 3D, fixed in front of the camera: `offset` (camera space, meters, default `0 -0.5 -1`), scaled by `desktopScale` (default 1) |

### In a headset: `vr`

| `vr` | What happens |
| --- | --- |
| `follow` (default) | Lazy follow: stays put while you look around a little, then glides back in front of you once it's out of a comfort cone. `distance` (m ahead, default 1.1), `height` (m relative to the eyes, default -0.25), `side` (m to the right, default 0), `maxAngle` (degrees, default 30) |
| `world` | Stands at the Surface's own `position` / `rotation` |
| `hand` | Attached to a controller: `hand` (selector, default `#leftHand`), `handPosition` (default `0 0.06 -0.15`), `handRotation` (default `-60 0 0`). While only simulating VR (no controllers) it follows instead, off to the side |

In VR the content is scaled by `scale` (default 0.45; 0.225 on a hand). `depthScale` scales thickness on top of that (default 1, 2 on a hand so small panels still look 3D).

## Pinning a mode

`mode="2d"` keeps HTML even in VR (e.g. a debug overlay); `mode="3d"` uses the `vr` placement even on a screen. The default, `auto`, follows `xr.immersive`.

## Opening and closing

`open` slides the Surface in and out (default `true`). In 3D it slides down out of view and the content is unmounted once it's gone; in HTML it's a Svelte transition.

```svelte
<script lang="ts">
  let menuOpen = $state(true);
</script>

<Surface desktop="camera" vr="follow" open={menuOpen}>…</Surface>
<a-entity id="leftHand" laser-controls="hand: left" onybuttondown={() => (menuOpen = !menuOpen)}></a-entity>
```

## Recipes

```svelte
<!-- A menu: 3D in front of the camera on desktop too, following your gaze in VR. -->
<Surface desktop="camera" offset="0 -0.3 -1" desktopScale={0.7} vr="follow">…</Surface>

<!-- A wrist menu: HTML top left on a screen, on the left controller in VR. -->
<Surface screen="top-left" vr="hand" hand="#leftHand">…</Surface>

<!-- A sign in the world: HTML on the right of the screen. -->
<Surface screen="right" vr="world" position="1.3 1.5 -1.2" rotation="0 -35 0">…</Surface>

<!-- Toasts: bottom right on a screen, up and to the right of your view in VR. -->
<Surface screen="bottom-right" vr="follow" side={0.5} height={0.05} distance={1.3}>
  <Toaster placement="bottom-right" />
</Surface>
```

The [starter](/templates#starter) uses each of these.

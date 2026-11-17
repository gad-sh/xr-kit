---
title: Tap to move (tap-to-move)
description: "@xr-kit/aframe-tap-to-move: tap or click the floor to move there on a phone or a desktop, or point a laser and pull the trigger in VR."
---

```sh
pnpm add @xr-kit/aframe-tap-to-move
```

```ts
// main.ts, after A-Frame
import 'aframe';
import '@xr-kit/aframe-tap-to-move';
```

Put `tap-to-move` on the rig, the entity that holds the camera and the hands. Tap the floor on a phone, click it on a desktop, or point a laser at it and pull the trigger in VR. A phone or a desktop has no thumbstick to [teleport](/reference/teleport) with, so this is how you get around there; in VR it's an alternative to teleport.

```svelte
<a-entity id="rig" tap-to-move="collisionEntities: .floor">
  <a-entity id="camera" camera look-controls position="0 1.6 0"></a-entity>
  <a-entity laser-controls="hand: right"></a-entity>
</a-entity>

<a-plane class="floor" bvh width="20" height="20" rotation="-90 0 0"></a-plane>
```

It moves the rig so the camera ends up over the spot, keeping your offset inside the rig (where you stand in your room in VR). The rig's height becomes the spot's height, as with `blink-controls`. The hands and the `follow` / `hand` [Surfaces](/guides/surfaces) come along, while `world` ones stay put.

## Options

| Option | Default | |
| --- | --- | --- |
| `collisionEntities` | (none) | Selector for what you can move onto. Required |
| `enabled` | `true` | `false` turns it off, e.g. while VR uses teleport |
| `landingMaxAngle` | `45` | Steepest surface you can land on (degrees from flat) |
| `speed` | `3` | Glide speed on a screen (m/s). `0` jumps |
| `vrSpeed` | `0` | The same in an immersive session: it jumps by default, since gliding in a headset makes many people queasy |
| `camera` | the scene's camera | The entity that ends up over the spot |

It emits `tapmove` on the rig when a move starts (`detail: { point, from, to, cursorEl }`, world space) and `tapmoveend` when you arrive.

## What counts as a tap

- A press from any A-Frame `cursor`: the mouse cursor (which handles touches too), the `laser-controls` hands, and the tap cursor [`Scene3D`](/components/scene3d) adds in AR. The floor doesn't need to be in their raycaster's `objects`.
- A press on something clickable (the UI, anything with `.raycastable`) is left to it. A clickable `collisionEntities` entity still counts.
- A press that moves more than 10 px on screen before release is a drag (looking around with `look-controls`), not a tap. A laser may turn up to 5°.
- The ray is cast once per press against every visible mesh. The first mesh it meets must belong to `collisionEntities` and face up within `landingMaxAngle`, so a panel, a wall or a platform's steep side in front of the floor blocks the tap. Meshes under `collisionEntities` count even when hidden, so an invisible walkable mesh works. Add [`bvh`](/reference/bvh) to big meshes to keep the cast fast.

In AR the floor is usually hidden (`hide-on-enter-ar`) but still counts, so set `enabled: false` there unless you want taps to move the rig.

## With teleport

The [starter](/templates#starter) has both: tap to move on a screen, and a choice in the menu in VR. In tap mode it removes `blink-controls` from the hand (so the thumbstick neither teleports nor turns):

```svelte
<script lang="ts">
  import { xr } from '@xr-kit/ui';
  let vrMovement = $state(0); // 0: teleport, 1: tap to move (a ButtonGroup in the menu)
  const tapToMove = $derived(!xr.presenting || vrMovement === 1);
</script>

<a-entity id="rig" tap-to-move="collisionEntities: .floor; enabled: {tapToMove}">
  …
  <a-entity
    laser-controls="hand: left"
    blink-controls={vrMovement === 1 ? undefined : 'cameraRig: #rig; teleportOrigin: #camera; collisionEntities: .floor'}
  ></a-entity>
</a-entity>
```

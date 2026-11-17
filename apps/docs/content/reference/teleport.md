---
title: Teleport (blink-controls)
description: @xr-kit/aframe-blink-controls: arc teleport on a VR controller's thumbstick, our fork of jure/aframe-blink-controls with fixes.
---

```sh
pnpm add @xr-kit/aframe-blink-controls
```

```ts
// main.ts, after A-Frame
import 'aframe';
import '@xr-kit/aframe-blink-controls';
```

Put `blink-controls` on a hand. Push the thumbstick forward to aim an arc, release to jump; left/right turns. It moves the `cameraRig`, so the hands and the `follow` / `hand` [Surfaces](/guides/surfaces) come along, while `world` ones stay put.

```svelte
<a-entity id="rig">
  <a-entity id="camera" camera look-controls wasd-controls position="0 1.6 0"></a-entity>
  <a-entity
    id="leftHand"
    laser-controls="hand: left"
    blink-controls="cameraRig: #rig; teleportOrigin: #camera; collisionEntities: .floor"
  ></a-entity>
</a-entity>

<a-plane class="floor" bvh width="20" height="20" rotation="-90 0 0"></a-plane>
```

It lands on entities matching `collisionEntities`; surfaces steeper than `landingMaxAngle` (45°) are a miss. For detailed meshes (a scanned room, terrain), add [`bvh`](/reference/bvh): the arc casts 10–20 short rays a frame while you aim.

## Common options

| Option | Default | |
| --- | --- | --- |
| `cameraRig` | `#player` | The entity that moves |
| `teleportOrigin` | `#camera` | The head, for where you land relative to the rig |
| `collisionEntities` | `''` | Selector for what you can land on. Empty: a default plane at y = 0 |
| `button` | `''` | `thumbstick`, `trackpad`, `trigger`, `grip` or `menu`, instead of the default forward-stick aim |
| `landingMaxAngle` | `45` | Steepest surface you can land on (degrees) |
| `snapTurn` | `true` | Left/right on the stick turns |
| `rotateOnTeleport` | `true` | Aim the landing direction with the stick |
| `curveHitColor` / `curveMissColor` | `#4d93fd` / `#ff0000` | |

The rest are upstream's: see [jure/aframe-blink-controls](https://github.com/jure/aframe-blink-controls). It emits `teleported` on the hand after a jump.

## What the fork fixes

The package is [gad-sh/aframe-blink-controls](https://github.com/gad-sh/aframe-blink-controls) (`gadxr` branch): upstream `main` plus four fixes, each a separate commit:

- Each curve segment is raycast over its full length, so the arc can't pass through terrain or land past the drawn guide.
- The arc is measured down to the lowest collision mesh instead of world y = 0.
- `pause()` cancels an aim and ignores the stick until `play()`, so another control can borrow the thumbstick.
- The arc stops at the first surface it meets: one too steep to land on (a wall, a platform's side) is a miss, instead of the arc passing through it.

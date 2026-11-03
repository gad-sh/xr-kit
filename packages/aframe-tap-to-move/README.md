# @gadxr/aframe-tap-to-move

Tap a spot on the floor to move there, in A-Frame. On a phone you tap, on a desktop you click,
and in VR you point a laser at the spot and pull the trigger. A phone or a desktop has no
thumbstick to teleport with, so this is how you get around there. In VR it's an alternative
to teleport (`@gadxr/aframe-blink-controls`).

```js
import 'aframe';      // first: this package uses the AFRAME global
import '@gadxr/aframe-tap-to-move';
```

```html
<a-entity id="rig" tap-to-move="collisionEntities: .floor">
  <a-entity camera look-controls position="0 1.6 0"></a-entity>
  <a-entity laser-controls="hand: right"></a-entity>
</a-entity>
<a-plane class="floor" width="20" height="20" rotation="-90 0 0"></a-plane>
```

Put it on the rig, the entity that holds the camera and the hands. It moves the rig so the
camera ends up over the spot you tapped, and keeps your offset inside the rig (where you stand
in your room in VR). The rig's height becomes the spot's height, so the rig stands on the
floor and the camera stays above it (the same as `blink-controls`).

| Property | Default | |
| --- | --- | --- |
| `collisionEntities` | (none) | Selector for what you can move onto. Required. |
| `enabled` | `true` | Set it to `false` to turn it off, e.g. when VR uses teleport instead. |
| `landingMaxAngle` | `45` | The steepest surface you can land on, in degrees from flat. |
| `speed` | `3` | How fast you glide to the spot on a screen, in meters per second. `0` jumps there. |
| `vrSpeed` | `0` | The same in an immersive session. It jumps by default, because gliding in a headset makes many people queasy. |
| `camera` | the scene's camera | The entity that should end up over the spot. |

It emits `tapmove` on the rig when a move starts (`detail: { point, from, to, cursorEl }`,
in world space) and `tapmoveend` when you arrive.

## How a tap is recognized

- It works with every A-Frame `cursor` in the scene: the mouse cursor (which also handles
  touches), the `laser-controls` hands, and the cursor that `@gadxr/ui`'s `Scene3D` adds
  for taps in AR. It listens for their `mousedown` and `mouseup`. The floor doesn't need to be
  one of their raycaster's `objects`.
- A press on something clickable (anything the cursor hit, such as the UI) is left to that
  thing. A press on a `collisionEntities` entity that happens to be clickable still counts.
- A press that moves more than 10 px on screen before it's released is a drag (for example,
  looking around with `look-controls`), not a tap. A laser may turn up to 5° while pressed.
- The spot is where the tap's ray first meets a mesh. That mesh has to belong to one of the
  `collisionEntities` and face up within `landingMaxAngle`. Any visible mesh in front of it
  blocks the tap: a panel's background, a wall, or the steep side of a platform. Meshes under
  `collisionEntities` count even when they're hidden, so an invisible walkable mesh works.
- The ray is cast once per press, against every visible mesh in the scene. Use
  `@gadxr/aframe-bvh` on big meshes to keep that fast.

In AR the floor is usually hidden (`hide-on-enter-ar`), but a hidden floor still counts, so
set `enabled: false` there unless you want taps to move the rig.

## License

MIT

---
title: RadialMenu
description: A pie menu — hold to open, aim at a wedge, release to pick — driven by a controller's trigger and thumbstick in VR, or a held key and the pointer on desktop.
---

<!-- demo: RadialMenuDemo -->

Same `items` as [`Menu`](/components/menu) (dividers are skipped). Ways to drive it:

- **Desktop** (`hotkey`): hold the key; the ring opens at the pointer, moving the pointer aims, releasing the key picks. Clicking or hovering a wedge works too, and while it's open the arrow keys move round the ring, Enter picks and Escape cancels. The hotkey is ignored while typing in a field.
- **VR** (`controller`): `openOn` (default `triggerdown`) on that controller opens it, the thumbstick aims, `closeOn` (default `triggerup`) picks. The ring sits on the controller (placement per `hand`, mirrored for the left). Aiming back to the centre keeps the last wedge, so letting go of the stick before the trigger still picks it.
- **Yourself**: `bind:open`.

```svelte
<!-- Desktop: HTML, outside the scene. -->
<RadialMenu hotkey="e" items={reactions} onselect={react} disabled={xr.presenting} />

<!-- VR: on the right controller, opened with the grip. -->
<a-entity id="rightHand" laser-controls="hand: right">
  <RadialMenu dimension="3d" controller="#rightHand" hand="right" openOn="gripdown" closeOn="gripup"
    items={reactions} onselect={react} />
</a-entity>
```

On a controller, the stick aims: the laser on the same controller, and the scene's mouse cursor during a session, are ignored by the ring. If teleport (`blink-controls`) is on the same hand, it shares the thumbstick: put them on different hands, as the starter does.

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `items` | `MenuItem[]` | | Required |
| `onselect` | `(item, index: number) => void` | | |
| `open` | `boolean` | `false` | Bindable |
| `disabled` | `boolean` | `false` | |
| `hotkey` | `string` | | Desktop: the key to hold |
| `controller` | `string` | | VR: selector of the controller entity |
| `hand` | `'left' \| 'right'` | `'right'` | Which hand `controller` is, for the default placement |
| `openOn` | `string` | `'triggerdown'` | Controller event that opens it |
| `closeOn` | `string` | `'triggerup'` | Controller event that picks |
| `deadzone` | `number` | `0.5` | Thumbstick travel (0–1) before a wedge is picked |
| `startAngle` | `number` | centres wedge 0 at the top | Degrees counterclockwise from right where wedge 0 starts |
| `angleOffset` | `number` | per hand | Thumbstick only: rotates which wedge the stick points at |
| `radius` / `innerRadius` | `number` | `110` / `34` (smaller on a controller) | px |
| `labelRotation` | `number` | per hand | 3D: degrees to turn labels so they read upright |
| `dimension` | `'2d' \| '3d'` | from context | |
| …rest | | | On the root (`position` / `rotation` override the controller placement) |

The pure input logic is exported as `RadialInput`, with `wedgeAt` and `wedgeCenter`, for a ring of your own.

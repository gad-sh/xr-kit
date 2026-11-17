---
title: Keyboard
description: The VR keyboard. Place one in the scene; it opens while a 3D Input has focus in a headset, following your gaze, with a preview of the text.
---

```svelte
<Scene3D>
  <!-- …Surfaces with 3D Inputs… -->
  <Keyboard />
</Scene3D>
```

Place one `<Keyboard />` in the `<a-scene>`, not under the camera. While a 3D [`Input`](/components/input) has focus and [`xr.immersive`](/reference/api#xr) is true (a headset, or `xr.simulated`), it slides in on a Surface that lazily follows your gaze, below eye level and in front of other follow Surfaces.

- The line on top shows the text being typed (click it to move the caret), so the field itself can be anywhere.
- Keys are pressed with a laser and the trigger, or the mouse while simulating.
- Pages: letters, numbers, symbols. Shift once for one capital; tap it twice for caps lock. An `inputmode="numeric"` field opens on numbers.
- Enter submits (its label comes from the field's `enterkeyhint`), Done keeps the text and stops editing, × cancels.
- Its backing panel takes clicks, so a press between keys doesn't end editing.

On desktop without simulated VR it stays closed: a focused 3D field takes the physical keyboard.

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `distance` | `number` | `0.75` | Meters ahead (follow placement) |
| `height` | `number` | `-0.5` | Meters below eye level |
| `scale` | `number` | `0.3` | Size |
| `tilt` | `number` | `25` | Degrees it leans back to face you from below |

The layout is exported as `KEYBOARD` (rows of keys per page) if you want to build your own; see the [API reference](/reference/api#text-editing).

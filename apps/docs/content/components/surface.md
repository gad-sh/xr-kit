---
title: Surface
description: A piece of UI that's HTML on a screen and 3D in a headset. Placement on desktop (screen region or in front of the camera) and in VR (world, follow, hand).
---

```svelte
<Surface screen="bottom" vr="follow">
  <Panel title="Inventory">…</Panel>
</Surface>
```

Put Surfaces inside `<Scene3D>`, not under the camera. The [Surfaces guide](/guides/surfaces) explains the placements with recipes; this page lists the props. There's no live demo here because a Surface needs a scene: the [starter](/templates#starter) uses every placement.

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `desktop` | `'screen' \| 'camera'` | `'screen'` | Placement when not immersive |
| `vr` | `'follow' \| 'world' \| 'hand'` | `'follow'` | Placement when immersive |
| `mode` | `'auto' \| '2d' \| '3d'` | `'auto'` | `'2d'` pins HTML; `'3d'` pins the `vr` placement |
| `open` | `boolean` | `true` | Slides it in and out; 3D content unmounts once it has slid away |
| `screen` | `ScreenRegion` | `'bottom'` | `desktop="screen"`: `top-left`, `top`, `top-right`, `left`, `center`, `right`, `bottom-left`, `bottom`, `bottom-right` |
| `target` | `string` | | `desktop="screen"`: CSS selector to render the HTML into instead of a region |
| `camera` | `string` | `'[camera]'` | `desktop="camera"`: the camera entity |
| `offset` | `string` | `'0 -0.5 -1'` | `desktop="camera"`: position in camera space (m) |
| `desktopScale` | `number` | `1` | `desktop="camera"`: scale |
| `distance` | `number` | `1.1` | `vr="follow"`: meters ahead |
| `height` | `number` | `-0.25` | `vr="follow"`: meters relative to the eyes |
| `side` | `number` | `0` | `vr="follow"`: meters to the right |
| `maxAngle` | `number` | `30` | `vr="follow"`: degrees it can drift before moving back |
| `hand` | `string` | `'#leftHand'` | `vr="hand"`: the controller entity |
| `handPosition` | `string` | `'0 0.06 -0.15'` | `vr="hand"`: offset from the controller |
| `handRotation` | `string` | `'-60 0 0'` | `vr="hand"`: rotation on the controller |
| `scale` | `number` | `0.45` (`0.225` on a hand) | 3D size in VR |
| `depthScale` | `number` | `1` (`2` on a hand) | Extra thickness on top of `scale` |
| `children` | `Snippet` | | |
| …rest | | | `vr="world"`: attributes on the placed entity (`position`, `rotation`) |

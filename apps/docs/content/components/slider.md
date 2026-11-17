---
title: Slider
description: A single-value slider with a label and value. A native range input in 2D; in 3D a track you drag with the mouse or a laser.
---

<!-- demo: SliderDemo 3d -->

In 3D, press on the track or the thumb, then the value follows where the cursor's ray crosses the track's plane until you let go, so the drag survives drifting off the track and works the same for the mouse and a laser.

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `value` | `number` | `0` | Bindable |
| `min` | `number` | `0` | |
| `max` | `number` | `100` | |
| `step` | `number` | `1` | |
| `label` | `string` | `''` | Shown above, on the left |
| `showValue` | `boolean` | `true` | The value, above on the right |
| `disabled` | `boolean` | `false` | |
| `width` | `number` | `240` | px |
| `onchange` | `(value: number) => void` | | |
| `dimension` | `'2d' \| '3d'` | from context | |
| …rest | | | On the root element |

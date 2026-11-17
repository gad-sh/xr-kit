---
title: Button
description: A button in three kinds, four sizes and five shapes. HTML <button> in 2D; a rounded slab with a 3D label, clickable by the mouse or a laser, in 3D.
---

<!-- demo: ButtonKinds 3d -->

In 3D, a button is a slab (glass for `primary`, solid for `secondary`, none for `tertiary`, from `theme.space3d.material`) with a troika label, centred on its position and sized to fit the label. It grows a little on hover and sinks when pressed.

## Sizes and shapes

<!-- demo: ButtonSizes 3d=1.4 -->

`round`, `circle` and `square` buttons are as wide as they're tall, for a single character or icon. `pill`, `round` and `circle` are fully rounded.

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `label` | `string` | | The text. Required in 3D, where labels are plain strings |
| `children` | `Snippet` | | 2D only: replaces the label |
| `kind` | `'primary' \| 'secondary' \| 'tertiary'` | `'primary'` | |
| `size` | `'mini' \| 'compact' \| 'default' \| 'large'` | `'default'` | 28, 36, 48, 56 px tall |
| `shape` | `'default' \| 'pill' \| 'round' \| 'circle' \| 'square'` | `'default'` | |
| `isSelected` | `boolean` | | Selected style (set by a `ButtonGroup` with `mode`) |
| `disabled` | `boolean` | `false` | Greyed out, no clicks |
| `inert` | `boolean` | `false` | No clicks, but looks unchanged (e.g. a menu that's sliding away) |
| `onclick` | `(event: Event) => void` | | Mouse, keyboard (2D), or cursor / laser (3D) |
| `dimension` | `'2d' \| '3d'` | from context | |
| …rest | | | On the root: `<button>` in 2D, `<a-entity>` in 3D (`position`, `id`, `aria-label`, …) |

Inside a [`ButtonGroup`](/components/button-group), unset `kind`, `size`, `shape` and `disabled` come from the group.

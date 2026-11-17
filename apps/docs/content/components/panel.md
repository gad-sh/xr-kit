---
title: Panel
description: A container with an optional title and a corner action, stacking its children in a column. In 3D, a solid or glass slab that grows to fit its content.
---

<!-- demo: PanelDemo 3d=1.6 -->

The `action` snippet goes in the top-right corner, outside the column (e.g. a close button). In 3D the children are stacked by measured size, and the slab grows to fit them; `width` is a minimum.

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `title` | `string` | | Heading at the top |
| `action` | `Snippet` | | Top-right corner content |
| `kind` | `'solid' \| 'glass'` | `'solid'` | Glass refracts what's behind it (3D) |
| `fill` | `string` | `theme.colors.panel.fill` | Background color (solid) |
| `align` | `'start' \| 'center'` | `'start'` | Cross-axis alignment of the children |
| `width` | `number` | | px. A minimum in 3D |
| `padding` | `number` | `24` | px |
| `gap` | `number` | `16` | px between children |
| `catchClicks` | `boolean` | `false` | 3D: the slab absorbs cursor clicks, so they don't reach what's behind it (modals) |
| `dimension` | `'2d' \| '3d'` | from context | |
| `children` | `Snippet` | | |
| …rest | | | On the root element (`position`, `rotation` in 3D) |

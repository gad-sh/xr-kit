---
title: Stack
description: Layout only — a row or column of anything. Flexbox in 2D; measured layout in 3D.
---

<!-- demo: StackDemo 3d -->

Use a Stack to lay out several components where there's no Panel, and to group things inside one. In 3D it's how siblings avoid sitting on top of each other ([Layout in 3D](/guides/layout-3d)).

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `direction` | `'row' \| 'column'` | `'row'` | |
| `gap` | `number` | `8` | px |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | Cross-axis alignment of the children |
| `alignSelf` | `'start' \| 'center' \| 'end'` | | This stack's alignment in its parent (like CSS `align-self`) |
| `dimension` | `'2d' \| '3d'` | from context | |
| `children` | `Snippet` | | |
| …rest | | | On the root element |

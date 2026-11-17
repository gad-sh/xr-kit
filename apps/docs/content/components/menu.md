---
title: Menu
description: A list of selectable items with optional end labels, dividers, disabled items, and single-choice selection with a check.
---

<!-- demo: MenuDemo 3d=1.5 -->

Items are `{ label, id?, end?, disabled? }` or `{ divider: true }` (the `MenuItem` type). `end` is a label on the right (a shortcut, a count). Passing `selected` (an item's `id`, or its `label`) makes it a single-choice menu: the selected item gets a check, and picking another updates `selected`.

In 2D, focus moves with the arrow keys, Home and End. In 3D the rows are as wide as the widest one, on a backing slab.

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `items` | `MenuItem[]` | | Required |
| `onselect` | `(item, index: number) => void` | | `index` is the item's position in `items` |
| `selected` | `string` | | Bindable. An item's `id` or `label`; makes it single-choice |
| `width` | `number` | `200` | px, a minimum |
| `dimension` | `'2d' \| '3d'` | from context | |
| …rest | | | On the root element |

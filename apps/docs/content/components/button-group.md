---
title: ButtonGroup
description: A row of Buttons sharing kind, size and shape, optionally tracking a single (radio) or multiple (checkbox) selection.
---

<!-- demo: ButtonGroupModes 3d=1.3 -->

- Without `mode`, it's a row of buttons sharing their look; each button's own `onclick` runs.
- `mode="radio"`: `selected` is the index of the selected button.
- `mode="checkbox"`: `selected` is an array of indexes.

Buttons register in the order they're created, so their index is their position in the markup. In 3D the buttons are laid out in a row centred on the group, and the group takes its place in a parent `Panel` or `Stack`.

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `mode` | `'radio' \| 'checkbox'` | | Track a selection |
| `selected` | `number \| number[]` | | Bindable. An index (radio) or indexes (checkbox) |
| `kind` | `ButtonKind` | | For buttons that don't set their own |
| `size` | `ButtonSize` | | |
| `shape` | `ButtonShape` | | |
| `disabled` | `boolean` | `false` | |
| `gap` | `number` | `8` | px between buttons |
| `dimension` | `'2d' \| '3d'` | from context | Also applies to the buttons inside (set once) |
| `children` | `Snippet` | | The `Button`s |
| …rest | | | On the root element |

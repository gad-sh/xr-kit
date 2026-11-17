---
title: Checkbox
description: A checkbox, or a toggle switch with type="toggle". A native checkbox in 2D; in 3D the control and its label are one click target.
---

<!-- demo: CheckboxDemo 3d -->

In 2D it wraps a native `<input type="checkbox">`, so keyboards and screen readers work. In 3D the whole row (control and label) is one target for the cursor or a laser.

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `checked` | `boolean` | `false` | Bindable |
| `label` | `string` | `''` | |
| `type` | `'checkbox' \| 'toggle'` | `'checkbox'` | `toggle` is a switch |
| `disabled` | `boolean` | `false` | |
| `onchange` | `(checked: boolean) => void` | | |
| `dimension` | `'2d' \| '3d'` | from context | |
| …rest | | | On the root element |

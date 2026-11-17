---
title: ProgressBar
description: How far along something is, with an optional label and percentage, or an indeterminate sweep with infinite.
---

<!-- demo: ProgressDemo 3d -->

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `value` | `number` | `0` | |
| `max` | `number` | `100` | |
| `infinite` | `boolean` | `false` | No known amount: a segment sweeps back and forth |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Bar thickness: 4, 8 or 12 px |
| `label` | `string` | `''` | Above, on the left |
| `showValue` | `boolean` | `false` | The percentage, above on the right (not with `infinite`) |
| `color` | `string` | `theme.colors.progressBar.fill` | |
| `width` | `number` | `240` | px |
| `dimension` | `'2d' \| '3d'` | from context | |
| …rest | | | On the root element |

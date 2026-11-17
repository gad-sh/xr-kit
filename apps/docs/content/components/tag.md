---
title: Tag
description: A small, non-interactive status chip ("Live", "3 players") in five kinds, light or solid.
---

<!-- demo: TagDemo 3d=1.3 -->

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `label` | `string` | | Required |
| `kind` | `'neutral' \| 'accent' \| 'positive' \| 'warning' \| 'negative'` | `'neutral'` | |
| `variant` | `'light' \| 'solid'` | `'light'` | |
| `size` | `'small' \| 'medium'` | `'small'` | 24 or 32 px tall |
| `dimension` | `'2d' \| '3d'` | from context | |
| …rest | | | On the root element |

A Tag isn't clickable. To show a hint on hover, wrap it in a [`Tooltip`](/components/tooltip), which adds its own hit area in 3D.

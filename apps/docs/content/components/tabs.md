---
title: Tabs
description: A bar of tab titles over the active tab's content. WAI-ARIA tabs in 2D; in 3D the bar and content stack in a column.
---

<!-- demo: TabsDemo 3d=1.5 -->

With no `active`, the first enabled tab shows. In 2D the bar follows the WAI-ARIA tabs pattern: arrow keys, Home and End move between enabled tabs. Only the active tab's content is rendered.

## Tabs props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `active` | `string` | first enabled tab | Bindable. The active tab's `key` |
| `onchange` | `(key: string) => void` | | |
| `gap` | `number` | `12` | px between the bar and the content (3D) |
| `dimension` | `'2d' \| '3d'` | from context | |
| `children` | `Snippet` | | The `Tab`s |
| …rest | | | On the root element |

## Tab props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `key` | `string` | | Required. Identifies the tab |
| `title` | `string` | | Required. In the bar |
| `disabled` | `boolean` | `false` | |
| `children` | `Snippet` | | Content, shown while active |

A `Tab` must be inside `Tabs`.

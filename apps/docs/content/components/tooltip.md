---
title: Tooltip
description: A short hint that appears while the pointer rests on its trigger — the mouse, keyboard focus, or a VR laser.
---

<!-- demo: TooltipDemo 3d -->

Wrap the trigger. It shows after `delay` ms of hover, right away on keyboard focus (2D), and hides on leave or Escape. `bind:open` to show it yourself.

In 3D the trigger keeps its place in the layout and the bubble floats in front of it. The Tooltip adds an invisible hit area just behind the trigger, so a non-interactive trigger (an `Avatar`, a `Tag`) still gets hover, while a `Button` in front keeps its own.

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `content` | `string` | | Required. The hint |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | |
| `open` | `boolean` | `false` | Bindable |
| `delay` | `number` | `400` | ms of hover before it shows |
| `dimension` | `'2d' \| '3d'` | from context | |
| `children` | `Snippet` | | The trigger |
| …rest | | | On the root element |

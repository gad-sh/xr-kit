---
title: Avatar
description: A player's picture, or their initials on a color picked from their name, with an optional status dot. In 3D, a thin disc.
---

<!-- demo: AvatarDemo 3d -->

The color is picked from the name, so a player keeps the same color everywhere. With `src`, the picture replaces the initials once it has loaded (and they stay if it fails). In 3D the loaded image goes to the material directly, so data: URLs work; an SVG needs `width` and `height` attributes or it shows blank.

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `name` | `string` | `''` | Initials and color come from it |
| `src` | `string` | | Picture URL (loaded with `crossOrigin = 'anonymous'`) |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 24, 40 or 64 px |
| `status` | `'online' \| 'away' \| 'busy' \| 'offline'` | | Dot at the bottom right |
| `color` | `string` | from the name | |
| `dimension` | `'2d' \| '3d'` | from context | |
| …rest | | | On the root element |

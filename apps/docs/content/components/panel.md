---
title: Panel
description: A container with an optional title and a corner action, stacking its children in a column. In 3D, a solid or glass slab that grows to fit its content.
---

<!-- demo: PanelDemo 3d=1.6 -->

The `action` snippet goes in the top-right corner, outside the column (e.g. a close button). In 3D the children are stacked by measured size, and the slab grows to fit them; `width` is a minimum.

`collapsible` turns the whole title row into a header that folds the panel, like an accordion: tap anywhere on it, and a caret on the right points down while folded, up while open. Bind `open` to read or set it. Folded, the panel shows `summary` (if you give one) instead of its children, e.g. a one-line status. In 2D the header is a `<button>` with `aria-expanded`; in 3D the title row is a hit area for the cursor and lasers. An `action` sits beside the header, outside it.

```svelte
<Panel title="Search" collapsible bind:open>
	{#snippet summary()}<Text text="12 results" />{/snippet}
	<Input placeholder="Search" />
</Panel>
```

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `title` | `string` | | Heading at the top |
| `action` | `Snippet` | | Top-right corner content |
| `collapsible` | `boolean` | `false` | The title row folds and unfolds the panel, with a caret |
| `open` | `boolean` | `true` | Unfolded (collapsible). Bindable |
| `summary` | `Snippet` | | Shown instead of the children while folded |
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

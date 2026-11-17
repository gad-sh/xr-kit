---
title: Layout in 3D
description: How Panel, Stack and ButtonGroup lay out their children in 3D by measured size, and what that means for your markup.
---

In HTML, layout is CSS. In 3D there's no CSS, so the containers do it themselves: [`Panel`](/components/panel), [`Stack`](/components/stack), [`ButtonGroup`](/components/button-group), [`Tabs`](/components/tabs) and [`Menu`](/components/menu) measure each child (text sizes come from troika once it has laid out the glyphs) and place them in a row or column, centered on the container's own position. A Panel's slab then grows to fit.

## Wrap siblings in a container

Each 3D component centres itself on its parent's origin. Two components side by side **outside** a container end up on top of each other:

```svelte
<!-- In 3D both buttons sit at the same spot. -->
<Surface vr="follow">
  <Button label="Yes" />
  <Button label="No" />
</Surface>

<!-- Laid out in a row (2D: flexbox; 3D: measured). -->
<Surface vr="follow">
  <Stack gap={8}>
    <Button label="Yes" />
    <Button label="No" />
  </Stack>
</Surface>
```

Containers nest: a `Stack` of `Button`s inside a `Panel` takes its place in the panel's column like any other child.

## Alignment

`align` on a `Stack` or `Panel` sets the cross-axis alignment of its children (`start`, `center`, `end`; a Panel has `start` or `center`). A `Stack` can align itself in its parent with `alignSelf`, e.g. a row of actions at the right of a panel:

```svelte
<Panel title="Delete file?">
  <Text text="This can't be undone." />
  <Stack direction="row" gap={12} alignSelf="end">
    <Button label="Cancel" kind="tertiary" />
    <Button label="Delete" />
  </Stack>
</Panel>
```

## Gaps and sizes are px

`gap`, `padding` and `width` are px, like every token. A Panel's `width` is a minimum in 3D: content can make it wider.

## Your own entities

Plain A-Frame entities inside a container aren't measured; they sit at the container's origin. Position them yourself, or put them outside the container. To make a component of your own take part in layout, see `useSlot` in the library source (`packages/ui/src/layout.svelte.ts`): it's internal for now.

## Placing things by hand

Things that aren't part of a layout, like a 3D [`Modal`](/components/modal) or a [`Toaster`](/components/toaster), are placed with their own `position`. Put them where the player will see them, e.g. under the camera, or in a `Surface`.

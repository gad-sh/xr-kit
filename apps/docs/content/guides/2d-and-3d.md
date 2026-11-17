---
title: 2D and 3D
description: How a component decides whether it renders as HTML or as A-Frame entities, and how to choose for a subtree or a single component.
---

Every component in `@xr-kit/ui` has two renderers. Which one it uses is its **dimension**, `'2d'` or `'3d'`:

- **2D** (the default): plain HTML and CSS. A `Button` is a `<button>`, a `Slider` is an `<input type="range">`, a `Modal` is a `<dialog>`, so keyboards and screen readers work.
- **3D**: A-Frame entities. A `Button` is a rounded slab with a troika text label, which the mouse cursor or a VR laser clicks; a `Panel` is a slab that grows to fit what's inside it.

Both renderers read the same theme tokens and take the same props, so you write the markup once.

## Choosing the dimension

The dimension comes from context, set by the nearest of:

| What | Effect |
| --- | --- |
| [`<Scene3D>`](/components/scene3d) | Renders the `<a-scene>`; everything inside is 3D |
| `<Space3D>` | Everything inside is 3D, and it renders no DOM of its own. Use it inside an `<a-scene>` you render yourself |
| [`<Surface>`](/components/surface) | Picks 2D or 3D for its content from where it's placed (screen or VR) |
| `dimension="2d"` / `dimension="3d"` on a component | Overrides the context for that component (and, on a container, its children) |

Outside all of these, components are HTML.

```svelte
<Scene3D>
  <!-- 3D: an entity in the scene -->
  <Button label="In the world" position="0 1.5 -1" />
</Scene3D>

<!-- 2D: a <button> on the page -->
<Button label="On the page" />
```

A component reads its dimension once, when it's created. Changing `dimension` on a live component doesn't switch it; to switch, re-create it (a `{#key}` block), or let a [`Surface`](/guides/surfaces) do it.

## Your own A-Frame markup

Inside `<Scene3D>` you write ordinary A-Frame markup next to the components: `<a-sky>`, lights, models, your camera rig. Svelte attributes and `on…` handlers work on `<a-entity>` (A-Frame events bubble, so `onclick` works), and extra props on a 3D component go on its root entity, so you can position it:

```svelte
<Panel title="Scores" position="1 1.6 -2" rotation="0 -20 0">…</Panel>
```

## When A-Frame loads

The library only touches `AFRAME` and `THREE` when a 3D component mounts. A page (or route) that only renders 2D components never needs A-Frame at all, which is how the [`spa` template](/templates#spa) keeps its 2D routes light: its VR route imports `aframe` dynamically, then renders `<Scene3D>`.

## Sizes

All sizes are px, in props and theme tokens alike. In 3D they're converted with `theme.space3d.metersPerPx` (0.003125: a default 48 px button is 0.15 m tall), and text is drawn `textScale` (1.5×) larger so it reads in a headset. A [`Surface`](/components/surface) then scales its content again (0.45 in VR by default). See [Theming](/guides/theming) to change either.

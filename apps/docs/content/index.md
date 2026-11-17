---
title: xr-kit
description: Svelte 5 components and A-Frame packages for websites that progressively enhance with WebXR. The same markup renders as HTML on a screen and as 3D in a VR headset.
---

The kit is four npm packages and two templates:

| Package | What it is |
| --- | --- |
| [`@xr-kit/ui`](/components/button) | The design system: Svelte components that render as HTML on a screen, or as A-Frame entities in 3D and VR |
| [`@xr-kit/aframe-blink-controls`](/reference/teleport) | Teleport (`blink-controls`) for VR, a fork of `jure/aframe-blink-controls` with fixes |
| [`@xr-kit/aframe-tap-to-move`](/reference/tap-to-move) | Tap or click the floor to move there, on a phone, a desktop or in VR |
| [`@xr-kit/aframe-bvh`](/reference/bvh) | Fast raycasts against big static meshes, with three-mesh-bvh |

Built on Svelte 5, A-Frame 1.8 and three.js. It's early days: the API is small and may still change.

## One component, two renderers

Every component renders as plain HTML by default. Inside a [`<Scene3D>`](/components/scene3d) the same component renders as A-Frame entities instead: a button becomes a rounded slab with a 3D label, clickable with the mouse or a VR controller's laser. Switch this demo to 3D to see it:

<!-- demo: Hello 3d -->

A [`Surface`](/components/surface) goes further: it shows its content as HTML on a screen and switches it to 3D when the player puts on a headset, so one page works on a phone, a laptop and a Quest.

```svelte
<Scene3D>
  <!-- HTML at the bottom of the screen; follows your gaze in VR. -->
  <Surface screen="bottom" vr="follow">
    <Panel title="Hello">
      <Button label="Say hi" onclick={() => toaster.info('Hi!')} />
    </Panel>
  </Surface>
</Scene3D>
```

## Where to go next

- [Getting started](/getting-started): start a project from a template, or add the kit to an app you have.
- [2D and 3D](/guides/2d-and-3d) and [Surfaces](/guides/surfaces): the two ideas the rest builds on.
- [Components](/components/button): every component, with live demos and props.
- [For agents](/agents): if you're an AI agent (or briefing one), the short list of rules, and where to find these pages as Markdown.
- The [gallery](https://gad.sh/xr/gallery/) shows every component in 2D and 3D side by side.

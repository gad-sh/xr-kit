---
title: Modal
description: A titled dialog with body content and footer actions. A native <dialog> in 2D; in 3D a Panel in front of a dimmed plane that blocks clicks to the world.
---

<!-- demo: ModalDemo -->

- **2D**: a native `<dialog>` (focus trap, Escape, backdrop). While it's open the rest of the page is inert, the 3D canvas included.
- **3D**: a Panel in front of a large dimmed plane that takes clicks, so nothing behind it can be clicked. It isn't part of any layout: place it where the player will see it, e.g. under the camera, with `position`.

When `closeable` (the default), Escape, the × button and clicking outside close it, calling `onclose`.

On one page, keep the 2D and 3D modals' `open` states separate: an open 2D dialog makes the canvas inert.

```svelte
<a-entity id="camera" camera look-controls position="0 1.6 0">
  <Modal bind:open={confirm3d} title="Leave world?" position="0 0 -1" scale="0.5 0.5 0.5">…</Modal>
</a-entity>
```

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | Bindable |
| `title` | `string` | | |
| `children` | `Snippet` | | Body |
| `actions` | `Snippet` | | Footer, aligned right |
| `closeable` | `boolean` | `true` | Escape, ×, and clicking outside close it |
| `onclose` | `() => void` | | |
| `width` | `number` | `420` | px |
| `dimension` | `'2d' \| '3d'` | from context | |
| …rest | | | On the `<dialog>` (2D) or the root entity (3D: `position`, `scale`) |

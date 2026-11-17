---
title: For agents
description: How an AI coding agent should read these docs, and the rules that matter most when writing code with the kit.
---

These docs are written for people and agents alike. If you're an agent (or briefing one), this page is the short version.

## Read the docs as Markdown

- [`llms.txt`](https://gad.sh/xr/llms.txt) lists every page with a one-line summary, linked as Markdown.
- [`llms-full.txt`](https://gad.sh/xr/llms-full.txt) is every page in one file.
- Any page is available as Markdown by adding `.md` to its path: `https://gad.sh/xr/components/button.md` (the home page is `index.md`). Demo code is inlined, and links point at the other pages' Markdown.

The installed package has the source too: `node_modules/@xr-kit/ui/dist/` holds the `.svelte` components (each starts with a comment saying what it does) and `.d.ts` files with every prop.

## Rules

The mistakes that are easy to make, roughly in order of how often they bite:

1. **Load A-Frame before the library**, once. `import 'aframe'` first in `main.ts`, or a script tag, never both. The library never imports A-Frame; it reads `AFRAME` and `THREE` from the page.
2. **3D needs a scene.** A component renders in 3D only inside `<Scene3D>` (or `<Space3D>`, or with `dimension="3d"`); anywhere else it's HTML. [More](/guides/2d-and-3d).
3. **Put Surfaces inside `<Scene3D>`, not under the camera.** They place themselves (`follow`, `camera`, `hand`) in world space. [More](/guides/surfaces).
4. **3D content goes in a container.** Several components side by side at the top of a Surface or scene all sit at the same spot; wrap them in a `Panel` or `Stack`, which lays them out. [More](/guides/layout-3d).
5. **Clickable 3D things need the `raycastable` class** on the entity that owns the mesh, not on a wrapper. The cursor ignores `visible`: to make something unclickable, remove the class. [More](/guides/interaction).
6. **Per-frame code uses `everyFrame(scene, cb)`** or an A-Frame component, never `requestAnimationFrame`: the page's animation frames stop in a VR session. Desktop testing won't show this. [More](/guides/frame-loop).
7. **Sizes are px**, in props and theme tokens alike; 3D converts them with `theme.space3d.metersPerPx` (a 48 px button is 0.15 m tall). Don't pass meters to a component.
8. **3D labels are strings.** A `Button` in 3D shows its `label`; children only render in 2D. `Text` takes `text`.
9. **User text in troika goes through the library** (`Text`, `Input`). A-Frame splits attribute strings on `;`, so writing `troika-text="value: …"` yourself breaks on text with a semicolon.
10. **Keep 2D and 3D modal state separate** on one page: an open 2D `<dialog>` makes the rest of the page, the canvas included, inert.
11. **One `<Keyboard />` per scene**, and no more than one 3D text field has focus at a time.

## Check your work

Real VR can't be tested headlessly. Say what you verified and what still needs a headset. [Testing](/guides/testing) covers type checks, previewing the VR layout with `xr.simulated`, and driving an emulated Quest 3 with IWER, including the traps (key repeat, slow headless frames, short-lived toasts).

## A project rules file

To brief an agent working in an app built with the kit, add something like this to its `CLAUDE.md` or `AGENTS.md`:

```md
## xr-kit
- UI comes from `@xr-kit/ui` (docs: https://gad.sh/xr/llms.txt). Components are HTML outside
  `<Scene3D>` and A-Frame entities inside it; `Surface` switches a piece of UI between the two.
- A-Frame is imported first in main.ts; never import it again or add a script tag.
- 3D: put Surfaces in the scene (not under the camera), wrap several components in a Panel/Stack,
  give clickable entities the `raycastable` class, sizes are px.
- Per-frame code: `everyFrame(scene, cb)` from `@xr-kit/ui`, not requestAnimationFrame (paused in VR).
- Preview VR on desktop with `xr.simulated = true`. Real VR needs a headset: say what you couldn't test.
```

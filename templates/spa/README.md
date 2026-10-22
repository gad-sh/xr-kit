# gadxr spa

A mostly-2D single page app built with `@gadxr/ui` and SvelteKit, with a VR section: copy
it to start an app whose pages are HTML, and where some parts open in a headset.

## Start a project from it

```sh
npx degit gad-sh/xr-kit/templates/spa my-app
cd my-app
pnpm install
pnpm dev
```

The copy installs `@gadxr/ui` from npm. It works with npm too. Its `pnpm-workspace.yaml`
lets pnpm 11 install A-Frame 1.8, which pulls one of its own dependencies from git. Change
the `name` in its `package.json`, and its LICENSE if your project uses another license.

## What it shows

| Route | What it is |
| --- | --- |
| `src/routes/+layout.svelte` | The shell for every route: `ThemeProvider`, the navigation, the 2D `<Toaster />` |
| `/` (`+page.svelte`) | A form in a `Panel`: `Input`s (one with an `error`), a `Checkbox`, `Button`s, `toaster.*`, a `Modal` to confirm |
| `/settings` | `Tabs` with toggles and a `Slider` |
| `/vr` (`vr/+layout.svelte`, `vr/+page.svelte`) | The scene: a `Surface` in front of the camera (following your gaze in VR) and a 3D `Toaster` |

- **It renders in the browser only** (`ssr = false` in `src/routes/+layout.ts`), and builds
  to static files with `adapter-static`, with `index.html` as the fallback for every path.
  Host it anywhere that serves static files.
- **The 2D routes don't load A-Frame.** Outside a `<Scene3D>` the components are plain HTML,
  and the library only reads the `AFRAME` global when a 3D one mounts. `vr/+layout.svelte`
  imports A-Frame (with three.js, over 1 MB) when you open the VR section, then renders the
  scene.
- **The routes under `vr/` share one scene.** Add a page there and going between them swaps
  its Surfaces without rebuilding the scene, so a VR session carries on. Leaving `vr/`
  removes the scene, which ends the session.
- The navigation is plain links: the library has no link or nav component yet.

The [starter](../starter) shows the rest of the 3D side: placements for every `Surface`,
the VR keyboard, controller buttons, teleport, and per-frame code that keeps running in a
headset.

## Run it

In a copy, `pnpm install` and `pnpm dev` (**https**, via `vite-plugin-mkcert`: a headset
only offers Enter VR on https). `pnpm check` type-checks, `pnpm build` writes the site to
`build/`, and `pnpm preview` serves it.

Inside the kit, run pnpm from the repo root, not from this folder (its
`pnpm-workspace.yaml` would make it a project of its own): `pnpm install`, then `pnpm spa`.

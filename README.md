# gadxr-kit

Building blocks for WebXR pages with Svelte 5 and A-Frame 1.8.

| Package | What it is |
| --- | --- |
| [`packages/ui`](packages/ui) (`@gadxr/ui`) | The design system: Svelte components that render as HTML on a screen, or as A-Frame entities in 3D and VR |
| [`packages/aframe-blink-controls`](packages/aframe-blink-controls) (`@gadxr/aframe-blink-controls`) | Teleport (`blink-controls`), our fork of `jure/aframe-blink-controls` |
| [`packages/aframe-bvh`](packages/aframe-bvh) (`@gadxr/aframe-bvh`) | Fast raycasts against big static meshes with three-mesh-bvh (`bvh`) |
| [`templates/starter`](templates/starter) | The app to copy (`npx degit gad-sh/xr-kit/templates/starter my-app`): each way to use the library, on a screen and in a headset |
| [`templates/spa`](templates/spa) | A mostly-2D single page app to copy (`npx degit gad-sh/xr-kit/templates/spa my-app`): SvelteKit, HTML pages, and a VR section that loads A-Frame only when it's opened |
| [`apps/gallery`](apps/gallery) | Every component in 2D and 3D, [live on GitHub Pages](https://gad-sh.github.io/xr-kit/) |

```sh
pnpm install
pnpm dev     # the starter, on https://localhost:5173 (or the next free port)
pnpm spa     # the single page app template
pnpm gallery # the gallery
pnpm check   # svelte-check for the library, the templates and the gallery
pnpm test    # the library's tests (Node's test runner)
```

## Using it in an existing project

The project needs Vite with `@sveltejs/vite-plugin-svelte`, Svelte 5 and A-Frame 1.8. A
headset only offers Enter VR on https, so serve the dev server over https
(`vite-plugin-mkcert`, as the starter does).

Install the library, and the A-Frame packages you use:

```sh
pnpm add @gadxr/ui aframe
pnpm add @gadxr/aframe-blink-controls  # teleport
pnpm add @gadxr/aframe-bvh             # fast raycasts against big meshes
```

Load A-Frame before everything else, because the library and both A-Frame packages use the
`AFRAME` and `THREE` globals it defines:

```ts
// main.ts
import 'aframe';
import '@gadxr/aframe-blink-controls'; // only if you use teleport
import '@gadxr/aframe-bvh';            // only if you use bvh
import { mount } from 'svelte';
import App from './App.svelte';

mount(App, { target: document.getElementById('app')! });
```

Then import components from `@gadxr/ui` and put the 3D ones in a `<Scene3D>`.
`templates/starter/src/App.svelte` shows each way to use them, and `templates/spa` an app
of 2D pages with SvelteKit.

You can keep loading A-Frame with a `<script>` tag instead of importing it (still before the
app). In that case, don't import `aframe` as well. The library only reads the globals, so it
works unchanged. If you use `@gadxr/aframe-bvh`, also alias `'three'` in `vite.config.ts` to a module
that re-exports the global `THREE`, so three-mesh-bvh doesn't bundle a second copy (see
`packages/aframe-bvh/README.md`).

### Working on the kit and an app together

To change the kit while you use it in an app, link the packages from a clone instead of
installing them from npm. Clone this repo next to your project and install it:

```sh
git clone git@github.com:gad-sh/xr-kit.git gadxr-kit
cd gadxr-kit && pnpm install
```

Then point your dependencies at that folder (the paths assume it's named `gadxr-kit`).
Edits there show up in your project straight away, with no build step:

```json
"@gadxr/ui": "link:../gadxr-kit/packages/ui",
"@gadxr/aframe-blink-controls": "link:../gadxr-kit/packages/aframe-blink-controls",
"@gadxr/aframe-bvh": "link:../gadxr-kit/packages/aframe-bvh"
```

Linked packages use their own dependencies from this repo's `node_modules`. Vite still
gives the page one Svelte, but svelte-check doesn't. Keep your `svelte` version the same as
this repo's: a mismatch shows as a `Snippet` type error in `Modal.svelte`. (Installed from
npm, the library uses your project's Svelte, so this doesn't apply.)

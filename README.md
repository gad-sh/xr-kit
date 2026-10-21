# gadxr-kit

Building blocks for WebXR pages with Svelte 5 and A-Frame 1.8.

| Package | What it is |
| --- | --- |
| [`packages/ui`](packages/ui) (`@gadxr/ui`) | The design system: Svelte components that render as HTML on a screen, or as A-Frame entities in 3D and VR |
| [`packages/aframe-blink-controls`](packages/aframe-blink-controls) | Teleport (`blink-controls`), our fork of `jure/aframe-blink-controls` |
| [`packages/aframe-bvh`](packages/aframe-bvh) | Fast raycasts against big static meshes with three-mesh-bvh (`bvh`) |
| [`templates/starter`](templates/starter) | The app to copy: each way to use the library, on a screen and in a headset |

```sh
pnpm install
pnpm dev     # the starter, on https://localhost:5173 (or the next free port)
pnpm check   # svelte-check for the library and the starter
pnpm test    # the library's tests (Node's test runner)
```

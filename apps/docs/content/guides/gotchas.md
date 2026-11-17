---
title: Gotchas
description: Symptoms you might hit with the kit and A-Frame, and what causes each one.
---

| Symptom | Cause and fix |
| --- | --- |
| 3D buttons have no labels; console says `troika-text` is missing | `Scene3D` loads troika-text from unpkg if the page didn't. If you render your own `<a-scene>` with `<Space3D>`, add `<script src="https://unpkg.com/aframe-troika-text@0.14.0/dist/aframe-troika-text.min.js">` after A-Frame (the URL is exported as `TROIKA_SCRIPT`) |
| `AFRAME is not defined` | A-Frame must load before the library: `import 'aframe'` first in `main.ts`, or a script tag before the app |
| Two copies of three.js, or `three-mesh-bvh got a different three.js than A-Frame's` | A-Frame loaded twice (an import and a script tag), or `'three'` aliased in a page that imports npm A-Frame. See [One three.js](/reference/bvh#one-threejs) |
| Components in 3D overlap each other | They're siblings outside a container. Wrap them in a `Panel` or `Stack` ([Layout in 3D](/guides/layout-3d)) |
| My entity doesn't take clicks | Put `raycastable` on the entity that owns the mesh, not on a wrapper ([Interaction](/guides/interaction)) |
| Hiding an entity (`visible="false"`) doesn't stop clicks | The raycaster ignores `visible`. Remove the `raycastable` class |
| Something animated stops when entering VR | It uses `requestAnimationFrame`, which pauses in an XR session. Use `everyFrame` or an A-Frame component ([Per-frame code](/guides/frame-loop)) |
| Hover flickers off while a laser is still on a button | The scene's mouse cursor is still active in VR. `Scene3D` removes it unless `mouseCursorInVR` is set |
| A Surface under the camera behaves oddly | Surfaces place themselves in world space. Put them in the scene, not under the camera |
| The 3D canvas stops responding after opening a 2D Modal | An open `<dialog>` makes the rest of the page inert, canvas included. Keep 2D and 3D modal `open` states separate |
| `querySelector('[troika-text*=…]')` finds nothing | A-Frame doesn't keep component values in DOM attributes. Select by id, class or structure |
| Text with a `;` is cut off in 3D | A-Frame splits attribute strings on `;`. Pass text through `Text` / `Input` (they set troika's value directly), not a `troika-text="value: …"` string |
| An `Avatar` picture or a data: URL texture doesn't show in 3D | The material gets the loaded `<img>`, not a URL string. An SVG needs `width`/`height` attributes or it uploads blank |
| A wrist menu's text reads mirrored | The rotation shows the panel's back face. Flip the entity's rotation about an in-plane axis |
| Page shortcuts fire while typing in a 3D field | They don't: a focused 3D `Input` takes every key but Cmd/Ctrl shortcuts. For HTML fields, skip your shortcuts when the event target is an input |
| Pressing F on desktop goes fullscreen | A-Frame's `keyboard-shortcuts` enters VR (fullscreen on desktop) on F's keyup. A focused 3D `Input` swallows it while typing |
| `$state` object no longer `===` the original | `$state` deep-proxies plain objects. Use `$state.raw` for things compared by identity |
| `Snippet` type error in `Modal.svelte` when type-checking an app that links the kit | The app's `svelte` version differs from the kit's. Keep them the same |
| Enter VR button missing on the headset | The page isn't on https |

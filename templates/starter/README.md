# gadxr starter

A small app built with `@gadxr/ui`, the gadxr design system, showing each way
to use it: copy it to start a page that works on a screen and in a VR headset.

## Start a project from it

```sh
npx degit gad-sh/xr-kit/templates/starter my-app
cd my-app
pnpm install
pnpm dev
```

The copy installs `@gadxr/ui`, `@gadxr/aframe-blink-controls` and `@gadxr/aframe-bvh` from
npm. It works with npm too. Its `pnpm-workspace.yaml` lets pnpm 11 install A-Frame 1.8,
which pulls one of its own dependencies from git. Change the `name` in its `package.json`, and its LICENSE if your project uses another
license.

## What it shows

`src/App.svelte` is the whole app. Components render as HTML outside `<Scene3D>` and as
A-Frame entities inside it; a `Surface` switches a piece of UI between the two.

| Where it is | On a screen | In a headset |
| --- | --- | --- |
| Menu `Surface` (`desktop="camera" vr="follow"`): Buttons that call `toaster.*`, an `Input` | 3D, in front of the camera | 3D, following your gaze |
| Welcome `Surface` (`screen="right" vr="world"`) | HTML, right of the screen | 3D, standing in the world |
| Box `Surface` (`screen="top-left" vr="hand"`): a radio `ButtonGroup`, a toggle, a `Slider` that change a box in the scene | HTML, top left | 3D, on your left wrist |
| "Preview VR layout" toggle, outside the scene | HTML | (not shown) |
| Menu `open` (slides it in and out) | M | Y on the left controller |
| Teleport (`blink-controls` on the left hand) | (WASD and the mouse) | Left thumbstick: forward to aim, release to jump; left/right turns |
| Reactions `RadialMenu` | HTML: hold E, aim with the mouse, release | 3D on the right controller: hold grip, aim with the thumbstick, release |
| `<Toaster />` in a `Surface` (`screen="bottom-right" vr="follow"`) | HTML, bottom right | 3D, following your gaze, up and to the right |
| `<Keyboard />` | (a 3D field takes the physical keyboard) | 3D, opens while a field has focus |

It also shows:

- `<Scene3D>`, a floor, a sky and lights (plain A-Frame), and a camera rig with two
  `laser-controls` hands, so the controllers click the UI in VR.
- Teleporting in VR with `blink-controls` from `@gadxr/aframe-blink-controls` (imported in
  `main.ts`, after A-Frame). It lands on entities matching `collisionEntities` (the floor
  and two platforms have the `floor` class; their sides are too steep to land on) and moves the rig, so the hands and the `follow`/`hand` Surfaces
  come along while the `world` one stays put. The package is our fork of
  `jure/aframe-blink-controls`, with fixes (see its README).
- Fast raycasts with `bvh` from `@gadxr/aframe-bvh` (imported in `main.ts`, after A-Frame) on the
  floor and platforms. They're a few triangles, so it's there to copy: a detailed model or
  terrain you teleport onto needs it, because the arc casts 10–20 rays a frame while you aim.
  See [its README](https://www.npmjs.com/package/@gadxr/aframe-bvh).
- An entity of your own taking clicks: the box has the `raycastable` class (`RAYCASTABLE`).
- Controller buttons as events on the hand entity (`onybuttondown`; also `abuttondown`,
  `bbuttondown`, `xbuttondown`, `gripdown`, `triggerdown`, …).
- `everyFrame` for per-frame code that isn't an A-Frame component (the box floats).
  `requestAnimationFrame` stops in a headset, because frames come from the VR session,
  and testing on desktop won't show it.
- `xr.simulated`: press V (or the toggle) on desktop to preview the VR layout, and
  `xr.presenting` / `xr.immersive` to change the UI in a headset.
- A theme override with `ThemeProvider` and `createTheme` (the secondary buttons'
  color), which applies to the HTML and the 3D components alike.

## Run it

In a copy, `pnpm install` and `pnpm dev`. Inside the kit, run pnpm from the repo root, not
from this folder (its `pnpm-workspace.yaml` would make it a project of its own):

```sh
pnpm install
pnpm dev
```

Inside the kit it uses the local packages, not npm's: its version ranges match their
versions, and the kit's `.npmrc` links workspace packages that match. `pnpm check` fails
if one of them came from npm instead (after a version bump: update the range here).

It's served over https (`vite-plugin-mkcert`; a headset only offers Enter VR on https).
If another dev server is already on port 5173, Vite picks the next free port.

`pnpm check` type-checks it and `pnpm build` builds it (inside the kit:
`pnpm --filter starter check` / `build`).

## Open it on a headset

The dev server's certificate comes from mkcert, whose root certificate is only trusted
on your computer, so the headset's browser warns about it: continue past the warning.

**Over USB (Quest):** with the headset in developer mode and plugged in, forward the
port, then open `https://localhost:5173` in the headset's browser.

```sh
adb reverse tcp:5173 tcp:5173
```

Use the port Vite printed if it isn't 5173. Going through `localhost` keeps working
when your computer's network address changes.

**Over Wi-Fi:** start it with `pnpm --filter starter dev --host` and open the Network
address Vite prints, from a headset on the same network.

Then press the VR button at the bottom right of the page. There's no console in the
headset: over USB, open `chrome://inspect` in Chrome on your computer to see the
page's console and inspect it.

## What the page has to provide

- **A-Frame, loaded before the library.** `src/main.ts` does `import 'aframe'` first,
  which sets the `AFRAME` and `THREE` globals the library reads (it never imports
  A-Frame itself). Don't also add an A-Frame `<script>` tag: that would load a second
  three.js.
- **`svelte` and `aframe` as dependencies** (the library's peer dependencies).
- **A camera** in the scene. Surfaces with `desktop="camera"` attach to it.
- **`laser-controls` on the hands** for VR. `Scene3D` points them at the UI.

Everything else is done by the library: `Scene3D` sets up the mouse cursor and the
lasers, removes the mouse cursor in VR and restores it after, and loads troika-text
(for the 3D labels) from unpkg if the page hasn't. `index.html` needs no script tags
besides the app's entry.

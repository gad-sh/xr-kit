# gadxr AR

An AR page built with `@gadxr/ui`: on a Quest, press AR and a small solar system floats in
your room (passthrough), and you can put it on a table or the floor. Copy it to start a
mixed reality app with laser UI.

## Start a project from it

```sh
npx degit gad-sh/xr-kit/templates/ar my-app
cd my-app
pnpm install
pnpm dev
```

The copy installs `@gadxr/ui` from npm. It works with npm too. Its `pnpm-workspace.yaml`
lets pnpm 11 install A-Frame 1.8, which pulls one of its own dependencies from git. Change
the `name` in its `package.json`, and its LICENSE if your project uses another license.

## What it shows

`src/App.svelte` is the whole app.

- **Only the AR button** (`xr-mode-ui="XRMode: ar"` on `<Scene3D>`). It's at the bottom right
  of the scene, so `index.html` makes the scene fill the page.
- **Your room instead of the world.** The sky and floor are there for the desktop view, with
  `hide-on-enter-ar`. A-Frame skips the scene's background in AR, and the camera follows the
  headset from your real floor (`local-floor`, A-Frame's default).
- **Placing the model on a real surface** with A-Frame's `ar-hit-test` (and the `hit-test`
  and `anchors` features in `webxr`). Hold the trigger: an arrow shows where the laser meets
  a table, wall or floor. Release, and the model moves there, turned to face you. The Quest
  finds those surfaces from the room's Space Setup.
- **One trigger for clicking and placing.** `ar-hit-test` hears every press, so the app
  ignores a press that starts or ends with that hand's laser on the UI (anything
  `.raycastable`). The arrow still shows while you press a button.
- **Controls on your wrist.** A `Surface` (`screen="top-left" vr="hand"`) with a toggle, a
  `Slider` and a `Button`: HTML on a screen, on your left wrist in AR, out of the way of the
  room. "Bring it here" puts the model back in front of you.
- **An entity of your own taking clicks:** the sun has the `raycastable` class (`RAYCASTABLE`).
- `<Toaster />` in a `Surface` (`screen="bottom-right" vr="follow"`), and `xr.presenting` to
  change the help text in AR.

The [starter](../starter) shows the rest: every `Surface` placement, the VR keyboard,
controller buttons, teleport, and per-frame code that keeps running in a headset. They all
work in AR too.

Phones aren't supported yet. Chrome on Android starts AR here, but taps don't click the UI.
The library removes the mouse cursor in an immersive session and expects controller lasers,
and its Surface placements are made for a headset.

## Run it

In a copy, `pnpm install` and `pnpm dev`. Inside the kit, run pnpm from the repo root, not
from this folder (its `pnpm-workspace.yaml` would make it a project of its own):
`pnpm install`, then `pnpm ar`.

It's served over https (`vite-plugin-mkcert`; a headset only offers AR on https). `pnpm
check` type-checks it and `pnpm build` builds it (inside the kit: `pnpm --filter ar check` /
`build`).

On a desktop browser the page shows the scene and the controls, with no AR button: open it
on a Quest. See the starter's README for opening the dev server on a headset (over USB with
`adb reverse`, or over Wi-Fi with `--host`), and seeing its console.

## What the page has to provide

The same as the starter: A-Frame imported before the library (`src/main.ts`), `svelte` and
`aframe` as dependencies, a camera, and `laser-controls` on the hands. For AR, also:

- `xr-mode-ui="XRMode: ar"` for an AR button (or `xr` for both AR and VR). A-Frame shows it
  only where the browser supports `immersive-ar`.
- The WebXR features you use in `webxr`'s `optionalFeatures`.
- `hide-on-enter-ar` on anything that would cover the room.

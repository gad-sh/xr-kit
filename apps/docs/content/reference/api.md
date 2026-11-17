---
title: API reference
description: Everything @xr-kit/ui exports besides the components — XR state, the toast queue, per-frame code, theme helpers, constants, types, and the pure functions behind the components.
---

Everything here is a named export of `@xr-kit/ui`. Components have their own pages.

## xr

The XR state Surfaces switch on. A Svelte 5 reactive object: read it in markup or `$derived`, write `simulated`.

| Member | Type | |
| --- | --- | --- |
| `xr.presenting` | `boolean` | A real immersive session is running (`enter-vr` with `scene.xrSession`, in `vr-mode` or `ar-mode`) |
| `xr.simulated` | `boolean` | Set it to preview the VR layout on desktop |
| `xr.immersive` | `boolean` (read-only) | `presenting \|\| simulated`: what Surfaces and the Keyboard follow |
| `xr.watch(scene)` | `(scene) => void` | Follow a scene's `enter-vr` / `exit-vr`. `Scene3D` and every `Surface` call it; you only need it for a scene you render yourself |

```svelte
<Text text={xr.presenting ? 'Trigger clicks' : 'Click or press M'} />
<Checkbox type="toggle" label="Preview VR" bind:checked={xr.simulated} />
```

## toaster

The toast queue shown by every [`Toaster`](/components/toaster).

| Member | |
| --- | --- |
| `toaster.info(message, options?)`, `.positive`, `.warning`, `.negative` | Show a toast of that kind; returns its id |
| `toaster.show(message, { kind?, duration? })` | The same, with the kind as an option (default `'info'`) |
| `toaster.dismiss(id)` | Hide one |
| `toaster.clear()` | Hide all |
| `toaster.items` | `Toast[]`, reactive: `{ id, kind, message }` |
| `DEFAULT_TOAST_DURATION` | `4000` ms. `duration: 0` keeps a toast until dismissed |

Types: `Toast`, `ToastOptions` (`{ kind?: ToastKind; duration?: number }`), `ToastKind`.

## everyFrame

```ts
everyFrame(scene: Element, callback: () => void): () => void
```

Calls `callback` once per rendered frame, on the page's loop or the XR session's, switching when VR starts or ends. Returns `stop()`. See [Per-frame code in VR](/guides/frame-loop).

## ensure3d

```ts
ensure3d(): void
```

Registers the library's A-Frame components (`rounded`, `ui-follow`, `ui-attach`) once, and logs an error if `troika-text` isn't registered. Every 3D component calls it; call it yourself only to use `rounded` on your own entities before any component has mounted.

## Constants

| Export | Value | |
| --- | --- | --- |
| `RAYCASTABLE` | `'raycastable'` | The class cursors and lasers hit ([Interaction](/guides/interaction)) |
| `MOUSE_CURSOR` | `'rayOrigin: mouse; fuse: false'` | `Scene3D`'s default `cursor` |
| `TROIKA_SCRIPT` | `'https://unpkg.com/aframe-troika-text@0.14.0/dist/aframe-troika-text.min.js'` | The troika-text build `Scene3D` loads |

## Theme

| Export | |
| --- | --- |
| `defaultTheme` | The default (dark) theme |
| `createTheme(overrides?, base?)` | Deep-merges `overrides` into `base` (default `defaultTheme`) |
| `toMeters(theme, px)` | `px * theme.space3d.metersPerPx` |
| `Theme` | The theme's type |

See [Theming](/guides/theming).

## Types

| Type | Values |
| --- | --- |
| `Dimension` | `'2d' \| '3d'` |
| `ButtonKind` | `'primary' \| 'secondary' \| 'tertiary'` |
| `ButtonSize` | `'mini' \| 'compact' \| 'default' \| 'large'` |
| `ButtonShape` | `'default' \| 'pill' \| 'round' \| 'circle' \| 'square'` |
| `ButtonProps`, `TextProps` | The props of `Button` and `Text` |
| `TypographyVariant` | `'LabelXSmall' \| 'LabelSmall' \| 'LabelMedium' \| 'LabelLarge' \| 'HeadingSmall' \| 'HeadingMedium' \| 'ParagraphMedium'` |
| `TagKind` | `'neutral' \| 'accent' \| 'positive' \| 'warning' \| 'negative'` |
| `TagVariant`, `TagSize` | `'solid' \| 'light'`, `'small' \| 'medium'` |
| `SpinnerSize`, `ProgressBarSize`, `AvatarSize` | `'small' \| 'medium' \| 'large'` |
| `AvatarStatus` | `'online' \| 'away' \| 'busy' \| 'offline'` |
| `TooltipPlacement` | `'top' \| 'bottom' \| 'left' \| 'right'` |
| `MenuItem` | `{ id?: string; label: string; end?: string; disabled?: boolean } \| { divider: true }` |
| `SurfacePlacement` | `'world' \| 'follow' \| 'hand'` |
| `SurfaceDesktopPlacement` | `'screen' \| 'camera'` |
| `ScreenRegion` | `'top-left' \| 'top' \| 'top-right' \| 'left' \| 'center' \| 'right' \| 'bottom-left' \| 'bottom' \| 'bottom-right'` |

## Text editing

The 3D Input's logic, exported for fields of your own. All pure, except `textFocus`.

| Export | |
| --- | --- |
| `textFocus` | The page's focused 3D field: `textFocus.current` (an `Editable` or `null`), `focus(field)`, `blur(field)` |
| `Editable` | What a field registers as: `text`, `caret`, `placeholder`, `inputmode`, `enterKeyHint`, `el`, and `edit(action)`, `setCaret(i)`, `enter()`, `done()`, `cancel()`. The VR keyboard and key handling only talk to this |
| `edit(state, action, { multiline?, maxLength? })` | Applies an `EditAction` to `{ text, caret }`; returns `{ state, splice }` or `null`. Every edit is one splice (`{ at, remove, insert }`), the shape a shared document would send |
| `keyToAction(event)` | A `KeyboardEvent` → `EditAction`, `'enter'`, `'escape'` or `null` |
| `EditAction` | `insert` (with `text`), `backspace`, `delete`, `left`, `right`, `home`, `end` |
| `TextState`, `Splice` | `{ text, caret }`, `{ at, remove, insert }` |
| `KEYBOARD` | The VR keyboard layout: rows of keys for each `KeyboardPage` |
| `KeyboardPage`, `ShiftState`, `EnterKeyHint` | `'letters' \| 'numbers' \| 'symbols'`, `'off' \| 'once' \| 'caps'`, `'enter' \| 'done' \| 'go' \| 'next' \| 'search' \| 'send'` |

## Style and layout helpers

The pure functions both renderers use, so a component of your own can match.

| Export | |
| --- | --- |
| `resolveButtonStyle(theme, { kind?, size?, shape?, selected?, disabled? })` | A button's height, padding, radius, font, fills, text color and 3D material |
| `resolveCheckboxStyle(theme, { type?, checked?, disabled? })` | Checkbox / toggle sizes and colors |
| `resolveTagStyle(theme, { kind?, variant?, size? })` | Tag size and colors |
| `resolveInputStyle(theme, { focused?, hovered?, error?, disabled? })` | Input colors |
| `resolveKeyStyle(theme, { kind?, hovered?, pressed?, on? })` | VR key colors |
| `stackLayout(sizes, { direction, gap, align? })` | 3D stack math: total size and each item's offset (meters, centred on the origin) |
| `sliderFraction(value, min, max)`, `sliderValueAt(fraction, min, max, step?)` | Slider value ↔ position |
| `nextIndex(usable, from, direction, wrap?)` | Roving focus over items, skipping unusable ones |
| `initials(name)`, `avatarColor(name, palette)` | Avatar initials and the color picked from a name |
| `tooltipOffset(placement, trigger, bubble, gap)` | Where a tooltip bubble's centre goes, relative to its trigger's |
| `wedgeAt(x, y, { count, startAngle }, deadzone?)`, `wedgeCenter(index, layout)` | Radial menu geometry (degrees, counterclockwise from right) |
| `RadialInput` | Hold-to-open / aim / release input for a radial menu: `start()`, `aim(x, y)`, `point(i)`, `release()` |

---
title: Text input and the VR keyboard
description: How Input works in 2D and 3D, the VR Keyboard, and submit/cancel semantics.
---

[`Input`](/components/input) is a single-line text field. In 2D it's a native `<input>`. In 3D it's a field with a caret, and it gets its keys from:

- **The physical keyboard**, on desktop or a keyboard paired with the headset. Click the field to focus it and place the caret.
- **The VR [`Keyboard`](/components/keyboard)**, in an immersive session (or `xr.simulated`). Place one `<Keyboard />` in the scene; it opens while a 3D field has focus, on a Surface that follows your gaze, with a preview of the text on top.

```svelte
<Scene3D>
  <Surface desktop="camera" vr="follow">
    <Panel title="Join">
      <Input label="Your name" enterkeyhint="go" bind:value={name} onsubmit={join} />
    </Panel>
  </Surface>
  <Keyboard />
</Scene3D>
```

## Submit and cancel

| Action | Physical keyboard | VR keyboard | Result |
| --- | --- | --- | --- |
| Submit | Enter | the enter key (labelled by `enterkeyhint`) | `onsubmit(value)`; editing ends unless `blurOnSubmit={false}` or `onsubmit` returns `false` |
| Done | click elsewhere | Done | Editing ends, the text stays |
| Cancel | Escape | × | The value goes back to what it was before editing; `oncancel()` |

- `blurOnSubmit={false}`: stay in the field after submit, e.g. a chat box where Enter sends and you keep typing.
- `onsubmit` returning `false` keeps editing that once, e.g. when the value is invalid. Pair it with `error`.
- `inputmode="numeric"` opens the VR keyboard on its numbers page.
- `maxLength` caps the length, for typing and pasting alike.

## Focus

One 3D field has focus at a time, page-wide (`textFocus.current`). Pressing the cursor (mouse or laser) anywhere but the field or the keyboard ends editing. `bind:focused` tells you whether a field has focus, and setting it focuses or blurs the field (2D and 3D).

While a 3D field has focus, it takes the keyboard: see [Keyboard and key shortcuts](/guides/interaction#keyboard-and-key-shortcuts).

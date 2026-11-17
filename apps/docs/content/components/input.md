---
title: Input
description: A single-line text field with label, caption and error. A native <input> in 2D; in 3D a field with a caret, typed into with the physical keyboard or the VR Keyboard.
---

<!-- demo: InputDemo 3d=1.4 -->

In the 3D preview, click a field and type on your keyboard. In a headset, a [`Keyboard`](/components/keyboard) in the scene opens instead. [Text input](/guides/text-input) covers submit, cancel and focus.

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `value` | `string` | `''` | Bindable |
| `label` | `string` | `''` | Above the field |
| `placeholder` | `string` | `''` | |
| `caption` | `string` | `''` | Below the field |
| `error` | `string` | `''` | Replaces the caption and turns the field red |
| `disabled` | `boolean` | `false` | |
| `width` | `number` | `280` | px |
| `maxLength` | `number` | | |
| `inputmode` | `'text' \| 'numeric'` | `'text'` | `numeric` opens the VR keyboard on its numbers page |
| `enterkeyhint` | `'enter' \| 'done' \| 'go' \| 'next' \| 'search' \| 'send'` | `'enter'` | Labels the VR keyboard's enter key (and a phone's, in 2D) |
| `blurOnSubmit` | `boolean` | `true` | `false` keeps the field (and keyboard) open after submit, e.g. chat |
| `focused` | `boolean` | `false` | Bindable. Setting it focuses or blurs the field |
| `onsubmit` | `(value: string) => boolean \| void` | | Enter. Return `false` to keep editing (e.g. invalid) |
| `oncancel` | `() => void` | | Escape / ×: the value goes back to what it was before editing |
| `dimension` | `'2d' \| '3d'` | from context | |
| …rest | | | On the root element |

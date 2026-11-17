---
title: Toaster
description: Shows the toast queue — short messages from toaster.info/positive/warning/negative — fixed to a corner in 2D, or as a column of panels in 3D.
---

<!-- demo: ToasterDemo -->

`toaster` is one queue for the page. Call it from anywhere; every `<Toaster>` shows it (render one in 2D, one in 3D, or both).

```ts
import { toaster } from '@xr-kit/ui';

toaster.info('Player 2 joined');
toaster.negative('Connection lost', { duration: 0 }); // stays until dismissed
const id = toaster.show('Uploading…', { kind: 'info' });
toaster.dismiss(id);
toaster.clear();
```

Toasts hide after `DEFAULT_TOAST_DURATION` (4000 ms) unless `duration` says otherwise; `0` keeps one until it's dismissed with its × button. See the [API reference](/reference/api#toaster).

- **2D**: fixed to the window corner given by `placement`.
- **3D**: a column of panels whose `placement` corner sits at the Toaster's position (`bottom-right` grows up and to the left from it). Put it in a [`Surface`](/components/surface), or under the camera, so it's in view.

```svelte
<!-- HTML bottom right on a screen; up and to the right of your view in VR. -->
<Surface screen="bottom-right" vr="follow" side={0.5} height={0.05} distance={1.3}>
  <Toaster placement="bottom-right" />
</Surface>
```

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `placement` | `'top-left' \| 'top' \| 'top-right' \| 'bottom-left' \| 'bottom' \| 'bottom-right'` | `'bottom-right'` | |
| `max` | `number` | `4` | Most toasts shown at once (the newest) |
| `dimension` | `'2d' \| '3d'` | from context | |
| …rest | | | On the root element (`position`, `scale` in 3D) |

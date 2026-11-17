---
title: Per-frame code in VR
description: Why requestAnimationFrame stops in a headset, and how to run code every frame with everyFrame or an A-Frame component.
---

In an immersive WebXR session the page's `window.requestAnimationFrame` is paused: frames come from the XR session instead (`session.requestAnimationFrame`). A loop built on `requestAnimationFrame` freezes the moment the player puts on the headset, and nothing on desktop shows it.

## everyFrame

`everyFrame(scene, callback)` calls `callback` once per rendered frame until you call the function it returns. It uses the page's loop on a screen and the session's loop in VR, switching when VR starts or ends:

```svelte
<script lang="ts">
  import { everyFrame } from '@xr-kit/ui';

  let box = $state<HTMLElement & { object3D?: any }>();
  $effect(() => {
    if (!box) return;
    // Returns the stop function, which the effect calls on cleanup.
    return everyFrame(box.closest('a-scene'), () => {
      box!.object3D.position.y = 1.2 + 0.1 * Math.sin(performance.now() / 600);
    });
  });
</script>

<a-box bind:this={box} position="-2 1.2 -3"></a-box>
```

## Or an A-Frame component

An A-Frame component's `tick(time, delta)` runs on the scene's own loop, which A-Frame keeps going in VR. Register it after A-Frame has loaded:

```ts
AFRAME.registerComponent('float', {
  tick(time) {
    this.el.object3D.position.y = 1.2 + 0.1 * Math.sin(time / 600);
  },
});
```

## Other things that stop in VR

Anything scheduled with `requestAnimationFrame` stops, including code in libraries you use (tweening, some physics loops). `setTimeout` and `setInterval` keep running. Svelte transitions in HTML don't matter in VR, since the HTML isn't visible.

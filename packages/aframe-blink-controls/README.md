# aframe-blink-controls (fork, copied in)

Teleport controls (`blink-controls`) from [jure/aframe-blink-controls](https://github.com/jure/aframe-blink-controls),
with our fixes. The fork is [gad-sh/aframe-blink-controls](https://github.com/gad-sh/aframe-blink-controls): the fixes
are on its `gadxr` branch (commit `fffcb75`, on upstream `main` at `115829e`). `src/index.js` and `LICENSE` are copied from it unchanged: don't edit them here,
change the fork and copy them again. Once the fork is published, depend on it instead of this package.

Fixes on top of upstream (one commit each, so they can go upstream as PRs):

- Each curve segment is raycast over its full length (upstream set `raycaster.far` from a normalized vector, so the
  arc could pass through terrain or land past the drawn guide).
- The arc is measured down to the lowest collision mesh instead of world y=0.
- `pause()` cancels an aim and ignores the stick until `play()`, so another control can borrow the thumbstick.
- The arc stops at the first surface it meets: one too steep to land on (a wall, a platform's side) is a miss,
  instead of the arc passing through it and landing behind or inside it.

Import it once A-Frame's `AFRAME` global exists: `import 'aframe-blink-controls'` (after `import 'aframe'`, or
anywhere in a page that loads A-Frame with a script tag).

// Scene3D's setup (src/aframe/scene.ts): lasers aim at .raycastable keeping their far,
// the mouse cursor goes away in VR and comes back after, troika-text is loaded on demand.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MOUSE_CURSOR, TROIKA_SCRIPT, setupScene } from '../src/aframe/scene.ts';

// Just enough of an A-Frame entity: records setAttribute/removeAttribute calls.
class FakeEl extends EventTarget {
  nodeType = 1;
  calls = [];
  constructor({ attrs = [], loaded = true, children = [], xrSession } = {}) {
    super();
    this.attrs = new Set(attrs);
    this.hasLoaded = loaded;
    this.children = children;
    this.xrSession = xrSession;
  }
  hasAttribute(name) { return this.attrs.has(name); }
  setAttribute(...args) { this.calls.push(args); }
  removeAttribute(name) { this.calls.push(['remove', name]); }
  querySelectorAll(selector) {
    assert.equal(selector, '[laser-controls]');
    return this.children.flatMap((c) => [...(c.hasAttribute('laser-controls') ? [c] : []), ...c.querySelectorAll(selector)]);
  }
}

// The last MutationObserver created, so a test can report DOM changes to it.
let observer;
globalThis.MutationObserver = class {
  constructor(callback) { this.callback = callback; observer = this; }
  observe(target, options) { this.target = target; this.options = options; }
  disconnect() { this.disconnected = true; }
};

const AIM = ['raycaster', 'objects', '.raycastable'];

test('lasers in the scene aim at .raycastable once loaded, setting only `objects` (far is kept)', () => {
  const ready = new FakeEl({ attrs: ['laser-controls'] });
  const loading = new FakeEl({ attrs: ['laser-controls'], loaded: false });
  const plain = new FakeEl({ attrs: ['raycaster'] });
  const scene = new FakeEl({ children: [new FakeEl({ children: [ready, loading] }), plain] });
  const cleanup = setupScene(scene);
  assert.deepEqual(ready.calls, [AIM]);
  assert.deepEqual(loading.calls, [], 'waits until the entity has loaded (its own raycaster set up)');
  loading.dispatchEvent(new Event('loaded'));
  assert.deepEqual(loading.calls, [AIM]);
  loading.dispatchEvent(new Event('loaded'));
  assert.deepEqual(loading.calls, [AIM], 'once');
  assert.deepEqual(plain.calls, [], 'a raycaster without laser-controls is left alone');
  cleanup();
});

test('hands mounted later, or given laser-controls later, are aimed too (once each)', () => {
  const scene = new FakeEl();
  const cleanup = setupScene(scene);
  assert.equal(observer.target, scene);
  assert.deepEqual(observer.options, { childList: true, subtree: true, attributes: true, attributeFilter: ['laser-controls'] });

  const hand = new FakeEl({ attrs: ['laser-controls'] });
  const rig = new FakeEl({ children: [hand] });
  const text = { nodeType: 3 };
  observer.callback([{ type: 'childList', addedNodes: [text, rig] }]);
  assert.deepEqual(hand.calls, [AIM]);

  const other = new FakeEl({ attrs: ['laser-controls'] });
  observer.callback([{ type: 'attributes', target: other }, { type: 'attributes', target: hand }]);
  assert.deepEqual(other.calls, [AIM]);
  assert.deepEqual(hand.calls, [AIM], 'not aimed twice');

  cleanup();
  assert.equal(observer.disconnected, true);
});

test('cleanup stops waiting for lasers that never loaded', () => {
  const loading = new FakeEl({ attrs: ['laser-controls'], loaded: false });
  const cleanup = setupScene(new FakeEl({ children: [loading] }));
  cleanup();
  loading.dispatchEvent(new Event('loaded'));
  assert.deepEqual(loading.calls, []);
});

test('the mouse cursor is removed in an immersive session and restored after', () => {
  const scene = new FakeEl();
  const cleanup = setupScene(scene, { cursor: 'rayOrigin: mouse; fuse: true' });

  // enter-vr without a session is fullscreen on desktop: keep the cursor.
  scene.dispatchEvent(new Event('enter-vr'));
  scene.dispatchEvent(new Event('exit-vr'));
  assert.deepEqual(scene.calls, []);

  scene.xrSession = {};
  scene.dispatchEvent(new Event('enter-vr'));
  assert.deepEqual(scene.calls, [['raycaster', 'enabled', false], ['remove', 'cursor']], 'raycaster off first, then the cursor');
  scene.calls = [];
  scene.xrSession = null;
  scene.dispatchEvent(new Event('exit-vr'));
  assert.deepEqual(scene.calls, [['raycaster', 'enabled', true], ['cursor', 'rayOrigin: mouse; fuse: true']]);

  cleanup();
  scene.calls = [];
  scene.xrSession = {};
  scene.dispatchEvent(new Event('enter-vr'));
  assert.deepEqual(scene.calls, [], 'cleanup removes the listeners');
});

test('the default cursor is the mouse cursor; mouseCursorInVR keeps it in VR', () => {
  const scene = new FakeEl({ xrSession: {} });
  const cleanup = setupScene(scene);
  scene.dispatchEvent(new Event('enter-vr'));
  scene.dispatchEvent(new Event('exit-vr'));
  assert.deepEqual(scene.calls.at(-1), ['cursor', MOUSE_CURSOR]);
  cleanup();

  const kept = new FakeEl({ xrSession: {} });
  const keep = setupScene(kept, { mouseCursorInVR: true });
  kept.dispatchEvent(new Event('enter-vr'));
  assert.deepEqual(kept.calls, []);
  keep();
});

// A page with a <head> that records the scripts added to it.
function fakePage(components) {
  const added = [];
  globalThis.AFRAME = { components };
  globalThis.document = {
    head: { appendChild: (el) => added.push(el) },
    createElement: (tag) => Object.assign(new EventTarget(), { tag }),
    querySelector: (selector) => added.find((el) => selector === `script[src="${el.src}"]`) ?? null,
  };
  return added;
}

// Each test gets its own module, since the load is shared module-wide.
const freshScene = (n) => import(`../src/aframe/scene.ts?troika=${n}`);

test('loadTroika: nothing to wait for when the page already registered troika-text', async () => {
  const { loadTroika } = await freshScene(1);
  const added = fakePage({ 'troika-text': {} });
  assert.equal(loadTroika(), null);
  assert.equal(added.length, 0);
});

test('loadTroika: adds the pinned script once and resolves when it has loaded', async () => {
  const { loadTroika } = await freshScene(2);
  const components = {};
  const added = fakePage(components);
  const first = loadTroika();
  assert.ok(first instanceof Promise);
  assert.equal(loadTroika(), first, 'a second Scene3D waits for the same load');
  assert.equal(added.length, 1);
  assert.equal(added[0].tag, 'script');
  assert.equal(added[0].src, TROIKA_SCRIPT);
  assert.match(TROIKA_SCRIPT, /aframe-troika-text@\d+\.\d+\.\d+\//, 'pinned to a version');

  let resolved = false;
  first.then(() => (resolved = true));
  await Promise.resolve();
  assert.equal(resolved, false);
  components['troika-text'] = {};
  added[0].dispatchEvent(new Event('load'));
  await first;
  assert.equal(loadTroika(), null, 'registered now');
});

test('loadTroika: a failed load is logged and still resolves, so the scene shows', async () => {
  const { loadTroika } = await freshScene(3);
  const added = fakePage({});
  const errors = [];
  const consoleError = console.error;
  console.error = (message) => errors.push(message);
  try {
    const loading = loadTroika();
    added[0].dispatchEvent(new Event('error'));
    await loading;
    assert.equal(errors.length, 1);
    assert.match(errors[0], /troika-text/);
  } finally {
    console.error = consoleError;
  }
});

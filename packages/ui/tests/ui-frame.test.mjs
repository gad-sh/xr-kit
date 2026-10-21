// everyFrame (src/aframe/frame.ts): must keep running inside an immersive XR
// session, where the page's requestAnimationFrame is paused (slider drags in VR).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { everyFrame } from '../src/aframe/frame.ts';

function fakeLoop() {
  const queue = new Map();
  let next = 1;
  return {
    requestAnimationFrame: (cb) => (queue.set(next, cb), next++),
    cancelAnimationFrame: (id) => queue.delete(id),
    step() { const cbs = [...queue.values()]; queue.clear(); cbs.forEach((cb) => cb()); },
    get pending() { return queue.size; },
  };
}

test('uses the XR session loop while presenting, not the paused page loop', () => {
  const page = fakeLoop();
  const session = fakeLoop();
  const saved = { raf: globalThis.requestAnimationFrame, caf: globalThis.cancelAnimationFrame };
  globalThis.requestAnimationFrame = page.requestAnimationFrame;
  globalThis.cancelAnimationFrame = page.cancelAnimationFrame;
  try {
    let calls = 0;
    const stop = everyFrame({ xrSession: session }, () => calls++);
    assert.equal(page.pending, 0, 'nothing scheduled on the page loop');
    session.step();
    session.step();
    assert.equal(calls, 2);
    stop();
    assert.equal(session.pending, 0, 'stop cancels the pending frame');
    session.step();
    assert.equal(calls, 2);
  } finally {
    globalThis.requestAnimationFrame = saved.raf;
    globalThis.cancelAnimationFrame = saved.caf;
  }
});

test('uses the page loop when not presenting', () => {
  const page = fakeLoop();
  const saved = { raf: globalThis.requestAnimationFrame, caf: globalThis.cancelAnimationFrame };
  globalThis.requestAnimationFrame = page.requestAnimationFrame;
  globalThis.cancelAnimationFrame = page.cancelAnimationFrame;
  try {
    let calls = 0;
    const stop = everyFrame({ xrSession: undefined }, () => calls++);
    page.step();
    assert.equal(calls, 1);
    stop();
    page.step();
    assert.equal(calls, 1);
  } finally {
    globalThis.requestAnimationFrame = saved.raf;
    globalThis.cancelAnimationFrame = saved.caf;
  }
});

// A loop started before entering VR (the headset receiving a screen share) has its next
// frame queued on the page loop, which the headset then pauses: it must move over.
test('moves to the session loop on enter-vr, and back on exit-vr', () => {
  const page = fakeLoop();
  const session = fakeLoop();
  const saved = { raf: globalThis.requestAnimationFrame, caf: globalThis.cancelAnimationFrame };
  globalThis.requestAnimationFrame = page.requestAnimationFrame;
  globalThis.cancelAnimationFrame = page.cancelAnimationFrame;
  try {
    const scene = new EventTarget();
    let calls = 0;
    const stop = everyFrame(scene, () => calls++);
    page.step();
    assert.equal(calls, 1);

    scene.xrSession = session;
    scene.dispatchEvent(new Event('enter-vr'));
    assert.equal(page.pending, 0, 'page frame cancelled');
    session.step();
    assert.equal(calls, 2, 'runs on the session loop');

    scene.xrSession = null;
    scene.dispatchEvent(new Event('exit-vr'));
    assert.equal(session.pending, 0, 'session frame cancelled');
    page.step();
    assert.equal(calls, 3, 'back on the page loop');

    stop();
    scene.dispatchEvent(new Event('enter-vr'));
    assert.equal(page.pending + session.pending, 0, 'stopped loops stay stopped');
  } finally {
    globalThis.requestAnimationFrame = saved.raf;
    globalThis.cancelAnimationFrame = saved.caf;
  }
});

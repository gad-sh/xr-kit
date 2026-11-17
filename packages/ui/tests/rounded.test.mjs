// rounded (src/aframe/rounded.ts): Button3D flips `glass` on and off (selected = solid) and updates often (hover colors).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadThree, instantiate } from './helpers.mjs';
import { registerRounded, roundedComponent } from '../src/aframe/rounded.ts';

const THREE = await loadThree();
const def = roundedComponent(THREE);

function makeSlab(data) {
  const objects = {};
  const el = { setObject3D: (name, obj) => (objects[name] = obj), getObject3D: (name) => objects[name] };
  const c = instantiate(def, el, data);
  c.init();
  c.update();
  return c;
}

test('glass can be turned off again, back to a solid colored slab', () => {
  const c = makeSlab({ glass: true, width: 0.4, height: 0.15 });
  assert.ok(c.rounded.material.isMeshPhysicalMaterial);
  Object.assign(c.data, { glass: false, color: '#276EF1' });
  c.update();
  assert.ok(!c.rounded.material.isMeshPhysicalMaterial, 'still glass after glass: false');
  assert.equal(c.rounded.material.color.getHexString(), new THREE.Color('#276EF1').getHexString());
});

test('repeated updates reuse the material and dispose old geometry', () => {
  const c = makeSlab({ glass: true });
  const material = c.rounded.material;
  let disposed = 0;
  for (let i = 0; i < 5; i++) {
    c.rounded.geometry.addEventListener('dispose', () => disposed++);
    c.data.width = 0.4 + i * 0.1;
    c.update();
  }
  assert.equal(c.rounded.material, material);
  assert.equal(disposed, 5);
});

test('glass stays clear even with a color set', () => {
  const c = makeSlab({ glass: true, color: '#ff00ed' });
  assert.equal(c.rounded.material.color.getHexString(), 'ffffff');
});

test('registers once with the page\'s A-Frame, using its three.js', () => {
  const registered = [];
  const AFRAME = {
    THREE,
    components: {},
    primitives: { primitives: {} },
    registerComponent(name, def) {
      if (this.components[name]) throw new Error(`${name} already registered`);
      this.components[name] = def;
      registered.push(name);
    },
    registerPrimitive(name, def) {
      this.primitives.primitives[name] = def;
      registered.push(name);
    },
  };
  registerRounded(AFRAME);
  registerRounded(AFRAME);
  assert.deepEqual(registered, ['rounded', 'a-rounded']);
  assert.throws(() => registerRounded(undefined), /A-Frame must be loaded/);
});

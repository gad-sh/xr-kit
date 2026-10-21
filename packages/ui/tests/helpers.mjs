// Shared helpers for running the library's A-Frame components in Node, without a browser.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// A-Frame bundles three.js as `super-three`; it isn't a direct dependency, so find it in
// pnpm's store (the workspace root's node_modules/.pnpm, above this package).
export async function loadThree() {
  let dir = path.dirname(fileURLToPath(import.meta.url));
  let store;
  while (!fs.existsSync((store = path.join(dir, 'node_modules/.pnpm')))) {
    if (dir === path.dirname(dir)) throw new Error('node_modules/.pnpm not found; run pnpm install');
    dir = path.dirname(dir);
  }
  const pkg = fs.readdirSync(store).find((d) => d.startsWith('super-three@'));
  if (!pkg) throw new Error('super-three not found; run pnpm install');
  const file = path.join(store, pkg, 'node_modules/super-three/build/three.module.js');
  const THREE = await import(pathToFileURL(file).href);
  globalThis.THREE = THREE;
  return THREE;
}

// Instantiate a component definition with schema defaults (plus overrides).
export function instantiate(def, el, data = {}) {
  const c = Object.create(def);
  c.el = el;
  c.data = Object.fromEntries(Object.entries(def.schema || {}).map(([k, v]) => [k, v.default]));
  Object.assign(c.data, data);
  return c;
}

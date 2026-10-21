// The design system stays self-contained: it imports only its own files and svelte.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const LIB = fileURLToPath(new URL('../src', import.meta.url));
const SOURCE = /\.(svelte|ts|js|css)$/;
// import x from '…', export … from '…', import '…', import('…'), css url('…') / @import '…'
const SPECIFIER = /(?:\bfrom\s*|\bimport\s*\(?\s*|@import\s+|url\(\s*)(['"])([^'"]+)\1/g;

function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(path.join(dir, e.name)) : SOURCE.test(e.name) ? [path.join(dir, e.name)] : []
  );
}

test('the library imports only its own files (relative paths) and svelte*', () => {
  const bad = [];
  for (const file of files(LIB)) {
    const src = fs.readFileSync(file, 'utf8').replace(/^\s*(\/\/|\*|\/\*).*$/gm, '');
    for (const [, , spec] of src.matchAll(SPECIFIER)) {
      if (spec === 'svelte' || spec.startsWith('svelte/')) continue;
      // Relative, and still inside the library (no reaching back into the app).
      if (/^\.\.?\//.test(spec) && !path.relative(LIB, path.resolve(path.dirname(file), spec)).startsWith('..')) continue;
      bad.push(`${path.relative(LIB, file)}: ${spec}`);
    }
  }
  assert.deepEqual(bad, []);
});

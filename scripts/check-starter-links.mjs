// The starter depends on version ranges (so a copy of it installs from npm), and inside the kit
// pnpm links the local packages only while their version fits the range (.npmrc). After a
// version bump that doesn't, it silently installs the old version from npm instead: fail then.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const starter = path.join(root, 'templates/starter');
const { dependencies } = JSON.parse(fs.readFileSync(path.join(starter, 'package.json'), 'utf8'));
const local = Object.fromEntries(
  fs.readdirSync(path.join(root, 'packages')).map((dir) => {
    const { name } = JSON.parse(fs.readFileSync(path.join(root, 'packages', dir, 'package.json'), 'utf8'));
    return [name, path.join(root, 'packages', dir)];
  }),
);
const wrong = Object.keys(dependencies)
  .filter((name) => local[name])
  .filter((name) => fs.realpathSync(path.join(starter, 'node_modules', name)) !== local[name]);
if (wrong.length) {
  console.error(
    `templates/starter installed ${wrong.join(', ')} from npm, not the local package: ` +
      `update its range in templates/starter/package.json to the new version, then pnpm install.`,
  );
  process.exit(1);
}
console.log('templates/starter uses the local packages');

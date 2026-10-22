// The templates depend on version ranges (so a copy of one installs from npm), and inside the
// kit pnpm links the local packages only while their version fits the range (.npmrc). After a
// version bump that doesn't, it silently installs the old version from npm instead: fail then.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const local = Object.fromEntries(
  fs.readdirSync(path.join(root, 'packages')).map((dir) => {
    const { name } = readJson(path.join(root, 'packages', dir, 'package.json'));
    return [name, path.join(root, 'packages', dir)];
  }),
);
let failed = false;
for (const dir of fs.readdirSync(path.join(root, 'templates'))) {
  const template = path.join(root, 'templates', dir);
  const { dependencies } = readJson(path.join(template, 'package.json'));
  const wrong = Object.keys(dependencies)
    .filter((name) => local[name])
    .filter((name) => fs.realpathSync(path.join(template, 'node_modules', name)) !== local[name]);
  if (wrong.length) {
    failed = true;
    console.error(
      `templates/${dir} installed ${wrong.join(', ')} from npm, not the local package: ` +
        `update its range in templates/${dir}/package.json to the new version, then pnpm install.`,
    );
  }
}
if (failed) process.exit(1);
console.log('the templates use the local packages');

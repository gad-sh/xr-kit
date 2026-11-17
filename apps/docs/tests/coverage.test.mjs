// Keeps the docs in step with @xr-kit/ui: every export is mentioned somewhere in the docs, and
// every prop of a component is listed on its page (as `name`). Run by `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const ui = join(root, '../../packages/ui/src');
const read = (path) => readFileSync(path, 'utf8');

function contentFiles(dir = join(root, 'content')) {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
		entry.isDirectory() ? contentFiles(join(dir, entry.name)) : entry.name.endsWith('.md') ? [join(dir, entry.name)] : []
	);
}
const allDocs = contentFiles().map(read).join('\n');

// The names after `export { … }` / `export type { … }` in index.ts.
function exportedNames() {
	const names = [];
	for (const [, list] of read(join(ui, 'index.ts')).matchAll(/export (?:type )?\{([^}]*)\}/g)) {
		for (const part of list.split(',')) {
			const name = part.trim().replace(/^type /, '').split(/\s+as\s+/).pop();
			if (name) names.push(name);
		}
	}
	return names;
}

test('every export of @xr-kit/ui is mentioned in the docs', () => {
	const missing = exportedNames().filter((name) => !new RegExp(`\\b${name}\\b`).test(allDocs));
	assert.deepEqual(missing, [], `not in any page under apps/docs/content: ${missing.join(', ')}`);
});

// Top-level keys of the object type starting at `anchor` in `source` (skipping `[attribute: string]`).
function propsOf(source, anchor) {
	const code = source.replace(/\/\/.*$/gm, '');
	const start = code.indexOf(anchor);
	assert.ok(start >= 0, `no "${anchor}"`);
	let depth = 0;
	let i = code.indexOf('{', start);
	const keys = [];
	for (; i < code.length; i++) {
		const ch = code[i];
		if ('{([<'.includes(ch)) depth++;
		else if ('})]>'.includes(ch) && code[i - 1] !== '=') {
			depth--;
			if (depth === 0) break;
		} else if (depth === 1) {
			const match = /^[\s;{]*?([A-Za-z_]\w*)\??:/.exec(code.slice(i));
			if (match && /[\s;{]/.test(code[i - 1] ?? ' ')) {
				keys.push(match[1]);
				i += match[0].length - 1;
			}
		}
	}
	return [...new Set(keys)];
}

const pages = {
	'components/scene3d': [['Scene3D.svelte', '}: {']],
	'components/surface': [['Surface.svelte', 'type Props = {']],
	'components/button': [['types.ts', 'type ButtonProps = {']],
	'components/button-group': [['ButtonGroup.svelte', 'type Props = {']],
	'components/panel': [['Panel.svelte', 'type Props = {']],
	'components/stack': [['Stack.svelte', 'type Props = {']],
	'components/text': [['types.ts', 'type TextProps = {']],
	'components/checkbox': [['Checkbox.svelte', 'type Props = {']],
	'components/slider': [['Slider.svelte', 'type Props = {']],
	'components/input': [['Input.svelte', 'type Props = {']],
	'components/keyboard': [['Keyboard.svelte', 'type Props = {']],
	'components/tag': [['Tag.svelte', 'type Props = {']],
	'components/spinner': [['Spinner.svelte', 'type Props = {']],
	'components/progress-bar': [['ProgressBar.svelte', 'type Props = {']],
	'components/avatar': [['Avatar.svelte', 'type Props = {']],
	'components/tooltip': [['Tooltip.svelte', 'type Props = {']],
	'components/tabs': [
		['Tabs.svelte', 'type Props = {'],
		['Tab.svelte', 'type Props = {'],
	],
	'components/menu': [['Menu.svelte', 'type Props = {']],
	'components/radial-menu': [['RadialMenu.svelte', 'type Props = {']],
	'components/modal': [['Modal.svelte', 'type Props = {']],
	'components/toaster': [['Toaster.svelte', 'type Props = {']],
	'components/theme-provider': [['ThemeProvider.svelte', '}: {']],
};

for (const [page, sources] of Object.entries(pages)) {
	test(`${page} lists every prop`, () => {
		const doc = read(join(root, 'content', `${page}.md`));
		const props = sources.flatMap(([file, anchor]) => propsOf(read(join(ui, file)), anchor));
		assert.ok(props.length > 0, `found no props for ${page}`);
		const missing = props.filter((prop) => !doc.includes(`\`${prop}\``));
		assert.deepEqual(missing, [], `${page}.md doesn't list: ${missing.join(', ')}`);
	});
}

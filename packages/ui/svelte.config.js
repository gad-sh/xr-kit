// For `pnpm build` (svelte-package): strips the TypeScript from the components' <script lang="ts">,
// so the published .svelte files are plain JavaScript with .d.ts files beside them.
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default { preprocess: vitePreprocess({ script: true }) };

import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// Relative asset URLs, so the build works under GitHub Pages' /<repo>/ path.
export default defineConfig({
  base: './',
  plugins: [svelte()],
});

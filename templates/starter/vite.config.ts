import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import mkcert from 'vite-plugin-mkcert';

// mkcert serves the dev server over https with a locally trusted certificate:
// browsers only offer WebXR (Enter VR) on https or localhost, and a headset isn't localhost.
export default defineConfig({
  plugins: [svelte(), mkcert()],
});

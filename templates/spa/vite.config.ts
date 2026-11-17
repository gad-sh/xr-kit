import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  plugins: [
    sveltekit({
      // A single page app: every route renders in the browser (ssr = false in
      // src/routes/+layout.ts), and the static host serves index.html for any path.
      adapter: adapter({ fallback: 'index.html' }),
    }),
    // https with a locally trusted certificate: a headset only offers Enter VR on https.
    mkcert(),
  ],
});

import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// Prerendered to static files. BASE_PATH is where the site is served from: the Pages workflow
// builds it for https://gad.sh/xr (a rewrite on gad.sh proxies /xr/ to GitHub Pages). Links in
// the pages are relative, so the same build also works at the github.io address.
// (Node's types aren't installed; this is the one thing used from them.)
declare const process: { env: Record<string, string | undefined> };
const base = (process.env.BASE_PATH ?? '') as '' | `/${string}`;

export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter(),
      paths: { base },
      prerender: {
        // The gallery is built separately and copied in next to the docs (gallery/).
        handleHttpError({ path, message }) {
          if (path.startsWith(`${base}/gallery/`)) return;
          throw new Error(message);
        },
      },
    }),
  ],
});

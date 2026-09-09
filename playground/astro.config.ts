import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  site: 'https://l5z12.github.io',
  base: process.env.GITHUB_ACTIONS ? '/fluentui-astro-icons' : '/',
  output: 'static',
  vite: {
    resolve: {
      alias: {
        'fluentui-astro-icons': fileURLToPath(new URL('../Icon.astro', import.meta.url)),
        'fluentui-astro-icons/render': fileURLToPath(new URL('../src/render.ts', import.meta.url)),
      },
    },
  },
});

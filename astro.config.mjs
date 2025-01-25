// @ts-check
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [tailwind()],
  adapter: cloudflare(),
  vite: {
    plugins: [nodePolyfills()],
    ssr: {
      external: ['node:buffer', 'node:worker_threads', 'node:async_hooks', 'undici']
    }
  },
});

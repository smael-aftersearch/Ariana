import { defineConfig } from 'vite';
import { ariana } from '@ariana/vite-plugin';

export default defineConfig({
  plugins: [ariana()],
  resolve: {
    alias: {
      '@ariana/core': new URL('../../packages/core/src/index.ts', import.meta.url).pathname,
      '@ariana/vite-plugin': new URL('../../packages/vite-plugin/src/index.ts', import.meta.url).pathname
    }
  }
});

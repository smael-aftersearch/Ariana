import { defineConfig } from 'vite';
import { ariana } from '../../packages/vite-plugin/src/index.ts';

export default defineConfig({
  plugins: [ariana()]
});

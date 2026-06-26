import { defineConfig } from 'vite';
import { ariana } from '@ariana-framework/vite-plugin';

export default defineConfig({
  plugins: [ariana({ strictTemplates: true })]
});

import { readFileSync } from 'node:fs';

const source = readFileSync('scripts/generated-app-smoke.mjs', 'utf8');
const required = [
  '@ariana-framework/core',
  '@ariana-framework/router',
  '@ariana-framework/forms',
  '@ariana-framework/query',
  '@ariana-framework/vite-plugin',
  'createRouter',
  'formArray',
  'formControl',
  'createQueryClient'
];

for (const fragment of required) {
  if (!source.includes(fragment)) throw new Error(`Generated app smoke coverage is missing ${fragment}.`);
}

console.log('Generated app smoke coverage check passed.');

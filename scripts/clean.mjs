import { rmSync } from 'node:fs';

const targets = [
  'packages/core/dist',
  'packages/compiler/dist',
  'packages/router/dist',
  'packages/forms/dist',
  'packages/query/dist',
  'packages/rendering/dist',
  'packages/vite-plugin/dist',
  'examples/counter-app/dist',
  'examples/counter-app/dist-types',
  'npm-packages',
  '.npm-pack-staging'
];

for (const target of targets) {
  rmSync(new URL(`../${target}`, import.meta.url), { recursive: true, force: true });
}

import { rmSync } from 'node:fs';

const targets = [
  'packages/core/dist',
  'packages/vite-plugin/dist',
  'examples/counter-app/dist',
  'examples/counter-app/dist-types'
];

for (const target of targets) {
  rmSync(new URL(`../${target}`, import.meta.url), { recursive: true, force: true });
}

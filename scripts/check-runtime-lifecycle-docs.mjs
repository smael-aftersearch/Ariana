import { readFileSync } from 'node:fs';

const source = readFileSync('docs/RUNTIME_LIFECYCLE.md', 'utf8');
const required = [
  'onInit()',
  'afterRender()',
  'onDestroy()',
  'Destroying a root bootstrap reference',
  'cleanup all render effects',
  'cleanup event listeners',
  'child component `onDestroy()`',
  'cleanup must be idempotent'
];

for (const fragment of required) {
  if (!source.includes(fragment)) throw new Error(`Missing runtime lifecycle documentation fragment: ${fragment}`);
}

console.log('Runtime lifecycle docs check passed.');

import { readFileSync } from 'node:fs';

const docs = readFileSync('docs/TEMPLATE_TYPECHECK_V1.md', 'utf8');
const source = readFileSync('packages/compiler/src/typecheck.ts', 'utf8');
const viteSource = readFileSync('packages/vite-plugin/src/index.ts', 'utf8');

const requiredDocs = [
  'interpolation expressions',
  'property bindings',
  'class bindings',
  'event bindings',
  '@if',
  '@for',
  '$index',
  '$event',
  'Component context inference',
  'inferComponentContextMembers(source)',
  'ARI_TYPE_UNKNOWN_MEMBER'
];

for (const fragment of requiredDocs) {
  if (!docs.includes(fragment)) throw new Error(`Template typecheck docs are missing: ${fragment}`);
}

for (const fragment of ['$index', '$event', 'TEMPLATE_GLOBALS', 'inferComponentContextMembers', 'mergeTypeCheckMembers', 'ARI_TYPE_UNKNOWN_MEMBER']) {
  if (!source.includes(fragment)) throw new Error(`Template typecheck source is missing: ${fragment}`);
}

for (const fragment of ['inferComponentContextMembers', 'mergeTypeCheckMembers', 'typeCheckTemplate']) {
  if (!viteSource.includes(fragment)) throw new Error(`Vite plugin is not using compiler-owned typecheck helper: ${fragment}`);
}

console.log('Template typecheck docs check passed.');

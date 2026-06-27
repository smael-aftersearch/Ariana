import { readFileSync } from 'node:fs';

const docs = readFileSync('docs/TEMPLATE_TYPECHECK_V1.md', 'utf8');
const source = readFileSync('packages/compiler/src/typecheck.ts', 'utf8');

const requiredDocs = [
  'interpolation expressions',
  'property bindings',
  'class bindings',
  'event bindings',
  '@if',
  '@for',
  '$index',
  '$event',
  'ARI_TYPE_UNKNOWN_MEMBER'
];

for (const fragment of requiredDocs) {
  if (!docs.includes(fragment)) throw new Error(`Template typecheck docs are missing: ${fragment}`);
}

for (const fragment of ['$index', '$event', 'TEMPLATE_GLOBALS', 'ARI_TYPE_UNKNOWN_MEMBER']) {
  if (!source.includes(fragment)) throw new Error(`Template typecheck source is missing: ${fragment}`);
}

console.log('Template typecheck docs check passed.');

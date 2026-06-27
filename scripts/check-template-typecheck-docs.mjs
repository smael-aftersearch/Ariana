import { readFileSync } from 'node:fs';

const docs = readFileSync('docs/TEMPLATE_TYPECHECK_V1.md', 'utf8');
const source = readFileSync('packages/compiler/src/typecheck.ts', 'utf8');
const diagnosticsSource = readFileSync('packages/compiler/src/diagnostics.ts', 'utf8');
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
  'Type-aware groundwork',
  'ARI_TYPE_UNKNOWN_PROPERTY',
  'ARI_TYPE_CALL_NON_METHOD',
  'ARI_TYPE_METHOD_ARGUMENT_COUNT',
  'formatTemplateDiagnostic(source, diagnostic)',
  'ARI_TYPE_UNKNOWN_MEMBER'
];

for (const fragment of requiredDocs) {
  if (!docs.includes(fragment)) throw new Error(`Template typecheck docs are missing: ${fragment}`);
}

for (const fragment of ['$index', '$event', 'TEMPLATE_GLOBALS', 'inferComponentContextMembers', 'mergeTypeCheckMembers', 'ARI_TYPE_UNKNOWN_MEMBER', 'ARI_TYPE_UNKNOWN_PROPERTY', 'ARI_TYPE_CALL_NON_METHOD', 'ARI_TYPE_METHOD_ARGUMENT_COUNT']) {
  if (!source.includes(fragment)) throw new Error(`Template typecheck source is missing: ${fragment}`);
}

for (const fragment of ['formatTemplateDiagnostic', 'formatTemplateDiagnostics']) {
  if (!diagnosticsSource.includes(fragment)) throw new Error(`Compiler diagnostics formatter source is missing: ${fragment}`);
}

for (const fragment of ['inferComponentContextMembers', 'mergeTypeCheckMembers', 'typeCheckTemplate', 'formatTemplateDiagnostic']) {
  if (!viteSource.includes(fragment)) throw new Error(`Vite plugin is not using compiler-owned typecheck helper: ${fragment}`);
}

console.log('Template typecheck docs check passed.');

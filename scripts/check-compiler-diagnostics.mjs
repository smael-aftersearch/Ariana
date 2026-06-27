import { readFileSync } from 'node:fs';

const docs = readFileSync('docs/COMPILER_DIAGNOSTICS_REGISTRY.md', 'utf8');
const parserSource = readFileSync('packages/compiler/src/index.ts', 'utf8');
const typecheckSource = readFileSync('packages/compiler/src/typecheck.ts', 'utf8');

const diagnostics = [
  'ARI_UNCLOSED_INTERPOLATION',
  'ARI_UNCLOSED_ELEMENT',
  'ARI_INVALID_ELEMENT',
  'ARI_MISSING_CLOSE_TAG',
  'ARI_INVALID_IF',
  'ARI_INVALID_FOR',
  'ARI_TYPE_UNKNOWN_MEMBER'
];

for (const code of diagnostics) {
  if (!docs.includes(code)) throw new Error(`Diagnostic ${code} is missing from docs.`);
  const source = code === 'ARI_TYPE_UNKNOWN_MEMBER' ? typecheckSource : parserSource;
  if (!source.includes(code)) throw new Error(`Diagnostic ${code} is missing from compiler source.`);
}

console.log('Compiler diagnostics registry check passed.');

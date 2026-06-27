import { readFileSync } from 'node:fs';

const docs = readFileSync('docs/COMPILER_DIAGNOSTICS_REGISTRY.md', 'utf8');
const parserSource = readFileSync('packages/compiler/src/index.ts', 'utf8');
const typecheckSource = readFileSync('packages/compiler/src/typecheck.ts', 'utf8');

const diagnostics = [
  ['ARI_UNCLOSED_INTERPOLATION', parserSource],
  ['ARI_UNCLOSED_ELEMENT', parserSource],
  ['ARI_INVALID_ELEMENT', parserSource],
  ['ARI_MISSING_CLOSE_TAG', parserSource],
  ['ARI_INVALID_IF', parserSource],
  ['ARI_INVALID_FOR', parserSource],
  ['ARI_UNKNOWN_BINDING', parserSource],
  ['ARI_INVALID_FOR_EXPRESSION', parserSource],
  ['ARI_TYPE_UNKNOWN_MEMBER', typecheckSource]
];

for (const [code, source] of diagnostics) {
  if (!docs.includes(code)) throw new Error(`Diagnostic ${code} is missing from docs.`);
  if (!source.includes(code)) throw new Error(`Diagnostic ${code} is missing from compiler source.`);
}

for (const requiredHeader of ['Parse diagnostics', 'Typecheck diagnostics', 'Version one rule']) {
  if (!docs.includes(requiredHeader)) throw new Error(`Compiler diagnostics docs are missing section: ${requiredHeader}`);
}

console.log('Compiler diagnostics registry check passed.');

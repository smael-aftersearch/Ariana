import { readFileSync } from 'node:fs';

const docs = readFileSync('docs/COMPILER_DIAGNOSTICS_REGISTRY.md', 'utf8');
const errorCodesDocs = readFileSync('docs/ERROR_CODES.md', 'utf8');
const parserSource = readFileSync('packages/compiler/src/index.ts', 'utf8');
const typecheckSource = readFileSync('packages/compiler/src/typecheck.ts', 'utf8');

const diagnostics = [
  ['ARI_UNCLOSED_INTERPOLATION', parserSource],
  ['ARI_EMPTY_INTERPOLATION', parserSource],
  ['ARI_UNCLOSED_ELEMENT', parserSource],
  ['ARI_INVALID_ELEMENT', parserSource],
  ['ARI_MISSING_CLOSE_TAG', parserSource],
  ['ARI_INVALID_IF', parserSource],
  ['ARI_INVALID_FOR', parserSource],
  ['ARI_UNKNOWN_BINDING', parserSource],
  ['ARI_INVALID_FOR_EXPRESSION', parserSource],
  ['ARI_EMPTY_BINDING_EXPRESSION', parserSource],
  ['ARI_UNSUPPORTED_BINDING_EXPRESSION', parserSource],
  ['ARI_TYPE_UNKNOWN_MEMBER', typecheckSource]
];

for (const [code, source] of diagnostics) {
  if (!docs.includes(code)) throw new Error(`Diagnostic ${code} is missing from registry docs.`);
  if (!errorCodesDocs.includes(code)) throw new Error(`Diagnostic ${code} is missing from error code docs.`);
  if (!source.includes(code)) throw new Error(`Diagnostic ${code} is missing from compiler source.`);
}

for (const requiredHeader of ['Diagnostic shape', 'Parse diagnostics', 'Typecheck diagnostics', 'Version one rule']) {
  if (!docs.includes(requiredHeader)) throw new Error(`Compiler diagnostics docs are missing section: ${requiredHeader}`);
}

for (const requiredSource of ['getSourceLocation', 'createTemplateDiagnostic', 'location', 'findTagEnd']) {
  if (!parserSource.includes(requiredSource)) throw new Error(`Compiler diagnostic source mapping is missing: ${requiredSource}`);
}

console.log('Compiler diagnostics registry check passed.');

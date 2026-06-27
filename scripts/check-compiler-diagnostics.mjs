import { readFileSync } from 'node:fs';

const registryDocs = readFileSync('docs/COMPILER_DIAGNOSTICS_REGISTRY.md', 'utf8');
const typeAwareDocs = readFileSync('docs/COMPILER_TYPE_AWARE_DIAGNOSTICS.md', 'utf8');
const errorCodesDocs = readFileSync('docs/ERROR_CODES.md', 'utf8');
const parserSource = readFileSync('packages/compiler/src/index.ts', 'utf8');
const typecheckSource = readFileSync('packages/compiler/src/typecheck.ts', 'utf8');
const formatterSource = readFileSync('packages/compiler/src/diagnostics.ts', 'utf8');

const diagnostics = [
  ['ARI_UNCLOSED_INTERPOLATION', parserSource, registryDocs],
  ['ARI_EMPTY_INTERPOLATION', parserSource, registryDocs],
  ['ARI_UNCLOSED_ELEMENT', parserSource, registryDocs],
  ['ARI_INVALID_ELEMENT', parserSource, registryDocs],
  ['ARI_MISSING_CLOSE_TAG', parserSource, registryDocs],
  ['ARI_INVALID_IF', parserSource, registryDocs],
  ['ARI_INVALID_FOR', parserSource, registryDocs],
  ['ARI_UNKNOWN_BINDING', parserSource, registryDocs],
  ['ARI_INVALID_FOR_EXPRESSION', parserSource, registryDocs],
  ['ARI_EMPTY_BINDING_EXPRESSION', parserSource, registryDocs],
  ['ARI_UNSUPPORTED_BINDING_EXPRESSION', parserSource, registryDocs],
  ['ARI_TYPE_UNKNOWN_MEMBER', typecheckSource, registryDocs],
  ['ARI_TYPE_UNKNOWN_PROPERTY', typecheckSource, typeAwareDocs],
  ['ARI_TYPE_CALL_NON_METHOD', typecheckSource, typeAwareDocs],
  ['ARI_TYPE_METHOD_ARGUMENT_COUNT', typecheckSource, typeAwareDocs]
];

for (const [code, source, docs] of diagnostics) {
  if (!docs.includes(code)) throw new Error(`Diagnostic ${code} is missing from diagnostics docs.`);
  if (!source.includes(code)) throw new Error(`Diagnostic ${code} is missing from compiler source.`);
}

for (const code of diagnostics.map(([code]) => code)) {
  if (!errorCodesDocs.includes(code)) throw new Error(`Diagnostic ${code} is missing from error code docs.`);
}

for (const requiredHeader of ['Diagnostic shape', 'Parse diagnostics', 'Typecheck diagnostics', 'Version one rule']) {
  if (!registryDocs.includes(requiredHeader)) throw new Error(`Compiler diagnostics docs are missing section: ${requiredHeader}`);
}

for (const requiredSource of ['getSourceLocation', 'createTemplateDiagnostic', 'location', 'findTagEnd']) {
  if (!parserSource.includes(requiredSource)) throw new Error(`Compiler diagnostic source mapping is missing: ${requiredSource}`);
}

for (const requiredFormatter of ['formatTemplateDiagnostic', 'formatTemplateDiagnostics', 'getSourceLine']) {
  if (!formatterSource.includes(requiredFormatter)) throw new Error(`Compiler diagnostic formatter is missing: ${requiredFormatter}`);
}

console.log('Compiler diagnostics registry check passed.');

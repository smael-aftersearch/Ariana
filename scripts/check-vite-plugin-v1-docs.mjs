import { readFileSync } from 'node:fs';

const docs = readFileSync('docs/VITE_PLUGIN_V1_CONTRACT.md', 'utf8');
const source = readFileSync('packages/vite-plugin/src/index.ts', 'utf8');
const migration = readFileSync('docs/DIAGNOSTIC_MIGRATION_NOTES_V1.md', 'utf8');

const requiredDocs = [
  'templateUrl',
  'styleUrl',
  'strictWarnings',
  'typeCheckTemplates',
  'templateTypeCheckMembers',
  'templateTypeCheckSymbols',
  'compiler-owned diagnostics'
];

for (const fragment of requiredDocs) {
  if (!docs.includes(fragment)) throw new Error(`Vite v1 contract is missing: ${fragment}`);
}

for (const fragment of ['strictWarnings', 'templateTypeCheckSymbols', 'createTypeCheckContextFromSource', 'findBlockingDiagnostic', 'formatTemplateDiagnostic']) {
  if (!source.includes(fragment)) throw new Error(`Vite plugin source is missing: ${fragment}`);
}

for (const fragment of ['Stable code rule', 'strictWarnings', 'templateTypeCheckSymbols']) {
  if (!migration.includes(fragment)) throw new Error(`Diagnostic migration notes are missing: ${fragment}`);
}

console.log('Vite plugin v1 docs check passed.');

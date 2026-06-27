import { readFileSync } from 'node:fs';

const source = readFileSync('docs/STABLE_API_SURFACE.md', 'utf8');
const requiredSections = ['Core', 'Compiler', 'Router', 'Forms', 'Query', 'Rendering', 'Vite plugin', 'CLI'];
const requiredTerms = [
  'signal',
  'computed',
  'effect',
  'bootstrapApplication',
  'parseTemplateToAst',
  'typeCheckTemplate',
  'inferComponentContextMembers',
  'mergeTypeCheckMembers',
  'getSourceLocation',
  'createTemplateDiagnostic',
  'createRouter',
  'formControl',
  'formArray',
  'createQueryClient',
  'renderToString',
  'ariana',
  'create-ariana'
];

for (const section of requiredSections) {
  if (!source.includes(`## ${section}`)) throw new Error(`Missing stable API section: ${section}`);
}

for (const term of requiredTerms) {
  if (!source.includes(term)) throw new Error(`Missing stable API term: ${term}`);
}

console.log('Stable API docs check passed.');

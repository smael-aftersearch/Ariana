import { readFileSync } from 'node:fs';
import { formatTemplateDiagnostics } from '../packages/compiler/dist/diagnostics.js';
import { createTypeCheckContextFromSource, typeCheckTemplate } from '../packages/compiler/dist/typecheck.js';

const [templatePath, componentPath] = process.argv.slice(2);

if (!templatePath) {
  console.error('Usage: node scripts/template-diagnostics.mjs <template.html> [component.ts]');
  process.exit(2);
}

const template = readFileSync(templatePath, 'utf8');
const componentSource = componentPath ? readFileSync(componentPath, 'utf8') : '';
const context = createTypeCheckContextFromSource(componentSource);
const result = typeCheckTemplate(template, context);

if (result.diagnostics.length === 0) {
  console.log('No template diagnostics.');
  process.exit(0);
}

console.log(formatTemplateDiagnostics(template, result.diagnostics, { fileName: templatePath, includeSourceLine: true }));
const hasError = result.diagnostics.some(diagnostic => diagnostic.level === 'error');
process.exit(hasError ? 1 : 0);

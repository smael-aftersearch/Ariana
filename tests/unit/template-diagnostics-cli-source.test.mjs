import { readFileSync } from 'node:fs';
import { test, assert } from './test-api.mjs';

test('template diagnostics CLI: uses compiler formatter and typecheck context from source', () => {
  const source = readFileSync('scripts/template-diagnostics.mjs', 'utf8');
  assert(source.includes('createTypeCheckContextFromSource'), 'CLI should infer context from component source');
  assert(source.includes('formatTemplateDiagnostics'), 'CLI should use shared diagnostic formatter');
  assert(source.includes('process.exit(hasError ? 1 : 0)'), 'CLI should fail on errors');
});

test('template diagnostics fixtures exist', () => {
  const component = readFileSync('tests/fixtures/template-diagnostics/page.component.ts', 'utf8');
  const template = readFileSync('tests/fixtures/template-diagnostics/page.component.html', 'utf8');
  assert(component.includes('user: { name: string }'), 'fixture should include typed object field');
  assert(template.includes('user.missingName'), 'fixture should include unknown property diagnostic');
  assert(template.includes('save()'), 'fixture should include method argument count diagnostic');
});

import { createTemplateDiagnostic } from '../../packages/compiler/dist/index.js';
import { formatTemplateDiagnostic, formatTemplateDiagnostics, getSourceLine } from '../../packages/compiler/dist/diagnostics.js';
import { test, equal, assert } from './test-api.mjs';

test('compiler diagnostics formatter: formats file line column code and message', () => {
  const source = '<h1>\n{{ missing }}\n</h1>';
  const diagnostic = createTemplateDiagnostic(source, 'error', 'ARI_TYPE_UNKNOWN_MEMBER', 'Unknown template member: missing', source.indexOf('{{'));
  const formatted = formatTemplateDiagnostic(source, diagnostic, { fileName: 'page.html' });
  assert(formatted.includes('page.html:2:1 ERROR ARI_TYPE_UNKNOWN_MEMBER'), formatted);
});

test('compiler diagnostics formatter: includes source line and pointer when requested', () => {
  const source = '<h1>\n  {{ missing }}\n</h1>';
  const diagnostic = createTemplateDiagnostic(source, 'error', 'ARI_TYPE_UNKNOWN_MEMBER', 'Unknown template member: missing', source.indexOf('{{'));
  const formatted = formatTemplateDiagnostic(source, diagnostic, { fileName: 'page.html', includeSourceLine: true });
  assert(formatted.includes('  {{ missing }}'), formatted);
  assert(formatted.includes('  ^'), formatted);
});

test('compiler diagnostics formatter: formats multiple diagnostics', () => {
  const source = '{{ }}';
  const diagnostic = createTemplateDiagnostic(source, 'error', 'ARI_EMPTY_INTERPOLATION', 'Interpolation expression cannot be empty.', 0);
  const formatted = formatTemplateDiagnostics(source, [diagnostic, diagnostic]);
  equal(formatted.split('\n').length, 2);
});

test('compiler diagnostics formatter: returns source line', () => {
  equal(getSourceLine('a\nb\nc', 2), 'b');
});

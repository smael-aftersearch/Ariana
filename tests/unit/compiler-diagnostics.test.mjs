import { getSourceLocation, parseTemplateToAst } from '../../packages/compiler/dist/index.js';
import { test, equal, assert } from './test-api.mjs';

function firstDiagnostic(template) {
  const result = parseTemplateToAst(template);
  assert(result.diagnostics.length > 0, 'expected at least one diagnostic');
  return result.diagnostics[0];
}

test('compiler diagnostics: includes source location', () => {
  const diagnostic = firstDiagnostic('<main>\n  {{ }}\n</main>');
  equal(diagnostic.code, 'ARI_EMPTY_INTERPOLATION');
  equal(diagnostic.location.line, 2);
  equal(diagnostic.location.column, 3);
});

test('compiler diagnostics: empty interpolation is reported', () => {
  const diagnostic = firstDiagnostic('<h1>{{ }}</h1>');
  equal(diagnostic.code, 'ARI_EMPTY_INTERPOLATION');
});

test('compiler diagnostics: empty binding expression is reported', () => {
  const diagnostic = firstDiagnostic('<button (click)="">Save</button>');
  equal(diagnostic.code, 'ARI_EMPTY_BINDING_EXPRESSION');
});

test('compiler diagnostics: unsupported binding expression shape is reported as warning', () => {
  const diagnostic = firstDiagnostic('<button (click)="() => save()">Save</button>');
  equal(diagnostic.code, 'ARI_UNSUPPORTED_BINDING_EXPRESSION');
  equal(diagnostic.level, 'warning');
});

test('compiler diagnostics: source location helper maps line and column', () => {
  const location = getSourceLocation('a\nbc\ndef', 5);
  equal(location.line, 3);
  equal(location.column, 1);
});

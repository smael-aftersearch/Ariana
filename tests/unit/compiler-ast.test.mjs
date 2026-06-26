import { parseTemplateToAst } from '../../packages/compiler/dist/index.js';
import { test, assert, equal } from './test-api.mjs';

test('compiler ast parses element and interpolation', () => {
  const result = parseTemplateToAst('<h1>Hello {{ name }}</h1>');
  equal(result.diagnostics.length, 0);
  const element = result.ast.children[0];
  equal(element.kind, 'Element');
  equal(element.tagName, 'h1');
  equal(element.children[1].kind, 'Interpolation');
  equal(element.children[1].expression, 'name');
});

test('compiler ast parses if blocks', () => {
  const result = parseTemplateToAst('@if (visible()) { <span>{{ label }}</span> }');
  equal(result.diagnostics.length, 0);
  const block = result.ast.children[0];
  equal(block.kind, 'IfBlock');
  equal(block.expression, 'visible()');
});

test('compiler ast parses for blocks', () => {
  const result = parseTemplateToAst('@for (row of rows(); track row.id) { <li>{{ row.name }}</li> }');
  equal(result.diagnostics.length, 0);
  const block = result.ast.children[0];
  equal(block.kind, 'ForBlock');
  equal(block.itemName, 'row');
  equal(block.iterableExpression, 'rows()');
  equal(block.trackExpression, 'row.id');
});

test('compiler ast reports diagnostics for invalid interpolation', () => {
  const result = parseTemplateToAst('<div>{{ name }</div>');
  assert(result.diagnostics.length > 0);
});

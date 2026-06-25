import { parseTemplateToAst } from '../../packages/compiler/dist/index.js';
import { test, assert, equal, deepEqual } from './test-runner.mjs';

test('compiler ast parses elements, attributes and interpolation', () => {
  const result = parseTemplateToAst('<button [disabled]="isDisabled" [class.active]="active" (click)="save()">Hello {{ name }}</button>');
  equal(result.diagnostics.length, 0);
  const button = result.ast.children[0];
  equal(button.kind, 'Element');
  equal(button.tagName, 'button');
  deepEqual(button.attributes.map(attribute => attribute.binding), ['property', 'class', 'event']);
  equal(button.children[0].kind, 'Text');
  equal(button.children[1].kind, 'Interpolation');
  equal(button.children[1].expression, 'name');
});

test('compiler ast parses if blocks with nested elements', () => {
  const result = parseTemplateToAst('@if (visible()) { <span>{{ label }}</span> }');
  equal(result.diagnostics.length, 0);
  const block = result.ast.children[0];
  equal(block.kind, 'IfBlock');
  equal(block.expression, 'visible()');
  const span = block.children.find(node => node.kind === 'Element');
  assert(span !== undefined);
  equal(span.tagName, 'span');
});

test('compiler ast parses for blocks with track expression', () => {
  const result = parseTemplateToAst('@for (row of rows(); track row.id) { <li>{{ row.name }}</li> }');
  equal(result.diagnostics.length, 0);
  const block = result.ast.children[0];
  equal(block.kind, 'ForBlock');
  equal(block.itemName, 'row');
  equal(block.iterableExpression, 'rows()');
  equal(block.trackExpression, 'row.id');
});

test('compiler ast reports diagnostics for invalid templates', () => {
  const result = parseTemplateToAst('<div>{{ name }</div>');
  assert(result.diagnostics.length > 0);
  assert(result.diagnostics.some(diagnostic => diagnostic.code === 'ARI_UNCLOSED_INTERPOLATION'));
});

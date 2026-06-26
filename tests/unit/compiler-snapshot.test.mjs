import { compileTemplateToRender } from '../../packages/vite-plugin/dist/compiler.js';
import { test, assert } from './test-api.mjs';

function code(template) {
  const result = compileTemplateToRender(template);
  assert('renderCode' in result, result.reason ?? 'compile failed');
  return result.renderCode;
}

function has(source, text) {
  assert(source.includes(text), `Missing compiled fragment: ${text}`);
}

test('compiler interpolation output shape', () => {
  const output = code('<p>Hello {{ name }}</p>');
  has(output, 'function __ari_render');
  has(output, 'data-ari-text');
  has(output, '__ari_effect');
  has(output, 'ctx');
});

test('compiler binding output shape', () => {
  const output = code('<button [disabled]="isDisabled()" [class.active]="active()" (click)="save()">Save</button>');
  has(output, 'data-ari-prop');
  has(output, 'data-ari-class');
  has(output, 'data-ari-event');
  has(output, 'addEventListener');
});

test('compiler if output shape', () => {
  const output = code('@if (visible()) { <span>{{ label }}</span> }');
  has(output, 'data-ari-if-anchor');
  has(output, 'ctx.visible()');
  has(output, '__ari_effect');
});

test('compiler for output shape', () => {
  const output = code('@for (row of rows(); track row.id) { <li>{{ row.name }}</li> }');
  has(output, 'data-ari-for-anchor');
  has(output, 'ctx.rows');
  has(output, 'row.id');
  has(output, '__ari_effect');
});

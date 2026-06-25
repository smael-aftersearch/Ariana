import { compileTemplateToRender } from '../../packages/vite-plugin/dist/compiler.js';
import { test, assert } from './test-runner.mjs';

function renderCode(template) {
  const result = compileTemplateToRender(template);
  assert('renderCode' in result, result.reason ?? 'compile failed');
  return result.renderCode;
}

function includes(source, text) {
  assert(source.includes(text), `Expected compiled output to include: ${text}`);
}

test('compiler snapshot: interpolation emits text binding marker and effect', () => {
  const code = renderCode('<p>Hello {{ name }}</p>');
  includes(code, 'function __ari_render');
  includes(code, 'data-ari-text');
  includes(code, 'ctx.name');
  includes(code, '__ari_effect');
});

test('compiler snapshot: property, class and event bindings are compiled', () => {
  const code = renderCode('<button [disabled]="isDisabled()" [class.active]="active()" (click)="save()">Save</button>');
  includes(code, 'data-ari-prop');
  includes(code, 'data-ari-class');
  includes(code, 'data-ari-event');
  includes(code, 'addEventListener');
  includes(code, 'ctx.save()');
});

test('compiler snapshot: if block emits anchor and conditional renderer', () => {
  const code = renderCode('@if (visible()) { <span>{{ label }}</span> }');
  includes(code, 'data-ari-if-anchor');
  includes(code, 'ctx.visible()');
  includes(code, 'createComment');
});

test('compiler snapshot: for block emits keyed list path', () => {
  const code = renderCode('@for (row of rows(); track row.id) { <li>{{ row.name }}</li> }');
  includes(code, 'data-ari-for-anchor');
  includes(code, 'ctx.rows');
  includes(code, 'track');
  includes(code, 'row.name');
});

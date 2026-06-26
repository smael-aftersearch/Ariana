import { compileTemplateToRender } from '../../packages/vite-plugin/dist/compiler.js';
import { test, assert } from './test-api.mjs';

function renderCode(template) {
  const result = compileTemplateToRender(template);
  assert('renderCode' in result, result.reason ?? 'compile failed');
  return normalize(result.renderCode);
}

function normalize(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function containsAll(source, fragments) {
  for (const fragment of fragments) assert(source.includes(fragment), `Missing compiler golden fragment: ${fragment}`);
}

test('compiler golden: static element with interpolation', () => {
  const output = renderCode('<h1>Hello {{ title }}</h1>');
  containsAll(output, ['function __ari_render', 'data-ari-text', '__ari_effect', 'ctx']);
});

test('compiler golden: property class and event bindings', () => {
  const output = renderCode('<button [disabled]="saving()" [class.active]="active()" (click)="save()">Save</button>');
  containsAll(output, ['data-ari-prop', 'data-ari-class', 'data-ari-event', 'addEventListener']);
});

test('compiler golden: control flow anchors', () => {
  const ifOutput = renderCode('@if (visible()) { <span>{{ title }}</span> }');
  const forOutput = renderCode('@for (item of items(); track item.id) { <span>{{ item.title }}</span> }');
  containsAll(ifOutput, ['data-ari-if-anchor', '__ari_effect']);
  containsAll(forOutput, ['data-ari-for-anchor', 'item.id', '__ari_effect']);
});

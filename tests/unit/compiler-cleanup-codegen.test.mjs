import { compileTemplateToRender } from '../../packages/vite-plugin/dist/compiler.js';
import { test, assert } from './test-api.mjs';

test('compiler: generated event listeners are tied to cleanup return function', () => {
  const result = compileTemplateToRender('<button (click)="save()">Save</button>');
  assert('renderCode' in result, result.reason ?? 'compile failed');
  assert(result.renderCode.includes('addEventListener'), 'event listener should be generated');
  assert(result.renderCode.includes('removeEventListener'), 'event listener cleanup should be generated');
  assert(result.renderCode.includes('cleanups.push'), 'event listener cleanup should be registered in cleanup list');
  assert(result.renderCode.includes('return () =>'), 'compiled render should return cleanup function');
});

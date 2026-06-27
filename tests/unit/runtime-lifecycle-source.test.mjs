import { readFileSync } from 'node:fs';
import { test, assert } from './test-api.mjs';

test('runtime lifecycle: renderComponent returns cleanup function', () => {
  const source = readFileSync('packages/core/src/template/render.ts', 'utf8');
  assert(source.includes('): () => void'), 'renderComponent should return a cleanup function type');
  assert(source.includes('return () => cleanupScope(scope)'), 'renderComponent should return a cleanup callback');
});

test('runtime lifecycle: child component cleanup is registered in parent scope', () => {
  const source = readFileSync('packages/core/src/template/render.ts', 'utf8');
  assert(source.includes('const childCleanup = renderComponent'), 'child render cleanup should be captured');
  assert(source.includes('scope.cleanups.push(() => {'), 'child cleanup should be registered in parent scope');
  assert(source.includes('onDestroy'), 'child onDestroy lifecycle should be considered during cleanup');
  assert(source.includes('childCleanup();'), 'child render cleanup should execute during parent cleanup');
});

test('runtime lifecycle: control-flow child scopes are cleaned when parent scope is cleaned', () => {
  const source = readFileSync('packages/core/src/template/render.ts', 'utf8');
  assert(source.includes('parentScope.cleanups.push(() => cleanupNodes(mountedNodes, childScope))'), 'if block nodes and scope should be registered with parent cleanup');
  assert(source.includes('for (const childScope of childScopes.splice(0)) cleanupScope(childScope)'), 'for block child scopes should be cleaned');
});

import { readFileSync } from 'node:fs';
import { test, assert } from './test-api.mjs';

test('core: compiled render path accepts cleanup scope context', () => {
  const source = readFileSync('packages/core/src/template/compiled.ts', 'utf8');
  assert(source.includes('CompiledRenderContext'), 'compiled render context type should exist');
  assert(source.includes('cleanupScope'), 'compiled render context should expose cleanupScope');
  assert(source.includes('cleanupScope.add(cleanup)'), 'compiled render cleanup should register with cleanup scope');
});

test('core: bootstrap passes cleanup scope to compiled render path', () => {
  const source = readFileSync('packages/core/src/component/bootstrap.ts', 'utf8');
  assert(source.includes('renderCompiledComponent(component, metadata'), 'bootstrap should call compiled renderer');
  assert(source.includes('cleanupScope)'), 'bootstrap should pass cleanup scope into compiled renderer');
});

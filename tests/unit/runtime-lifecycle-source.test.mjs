import { existsSync, readFileSync } from 'node:fs';
import { test, assert } from './test-api.mjs';

const bootstrapSourcePath = 'packages/core/src/component/bootstrap.ts';
const compiledSourcePath = 'packages/core/src/template/compiled.ts';
const runtimeRenderSourcePath = 'packages/core/src/template/render.ts';
const expressionSourcePath = 'packages/core/src/template/expression.ts';

test('runtime lifecycle: bootstrap requires compiled render function', () => {
  const source = readFileSync(bootstrapSourcePath, 'utf8');
  assert(source.includes('renderCompiledComponent'), 'bootstrap should use compiled renderer');
  assert(source.includes('does not have a compiled render function'), 'bootstrap should fail clearly when compiled render is missing');
  assert(!source.includes('renderComponent'), 'bootstrap should not fall back to unsafe runtime renderer');
});

test('runtime lifecycle: compiled render cleanup is registered in cleanup scope', () => {
  const source = readFileSync(compiledSourcePath, 'utf8');
  assert(source.includes('cleanupScope'), 'compiled renderer should accept cleanup scope context');
  assert(source.includes('if (cleanup && cleanupScope) cleanupScope.add(cleanup)'), 'compiled render cleanup should be registered in cleanup scope');
  assert(source.includes('host.replaceChildren(componentHost)'), 'compiled renderer should replace host children safely');
});

test('runtime lifecycle: unsafe runtime template renderer sources are not shipped from core', () => {
  assert(!existsSync(runtimeRenderSourcePath), 'runtime template renderer source should not exist in core');
  assert(!existsSync(expressionSourcePath), 'runtime expression evaluator source should not exist in core');
});

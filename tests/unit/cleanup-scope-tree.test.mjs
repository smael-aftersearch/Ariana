import { createCleanupScope } from '../../packages/core/dist/index.js';
import { test, equal } from './test-api.mjs';

test('cleanup scope: cleanup is idempotent', () => {
  const scope = createCleanupScope();
  let calls = 0;
  scope.add(() => calls++);
  scope.cleanup();
  scope.cleanup();
  equal(calls, 1);
  equal(scope.cleaned, true);
});

test('cleanup scope: child scope is cleaned with parent', () => {
  const parent = createCleanupScope();
  const child = parent.child();
  let calls = 0;
  child.add(() => calls++);
  parent.cleanup();
  equal(calls, 1);
  equal(child.cleaned, true);
});

test('cleanup scope: adding after cleanup runs immediately', () => {
  const scope = createCleanupScope();
  scope.cleanup();
  let calls = 0;
  scope.add(() => calls++);
  equal(calls, 1);
});

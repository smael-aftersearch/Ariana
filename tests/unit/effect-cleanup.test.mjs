import { effect, signal, createCleanupScope } from '../../packages/core/dist/index.js';
import { test, equal } from './test-api.mjs';

test('effect runs returned cleanup on rerun and dispose', () => {
  const value = signal(1);
  let cleanups = 0;
  const dispose = effect(() => {
    value();
    return () => { cleanups++; };
  });

  equal(cleanups, 0);
  value.set(2);
  equal(cleanups, 1);
  dispose();
  equal(cleanups, 2);
});

test('cleanup scope runs registered cleanups once', () => {
  const scope = createCleanupScope();
  let count = 0;
  const remove = scope.add(() => { count++; });
  equal(scope.size, 1);
  remove();
  equal(count, 1);
  equal(scope.size, 0);
  scope.cleanup();
  equal(count, 1);
});

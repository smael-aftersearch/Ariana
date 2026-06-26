import { createMutation } from '../../packages/query/dist/index.js';
import { test, equal, assert } from './test-api.mjs';

test('query: mutation tracks success state', async () => {
  const mutation = createMutation({ mutationFn: async value => value + 1 });
  const result = await mutation.mutate(1);
  equal(result, 2);
  equal(mutation.status(), 'success');
  equal(mutation.data(), 2);
});

test('query: mutation exposes rollback context on error', async () => {
  let rollbackValue;
  const mutation = createMutation({
    mutationFn: async () => { throw new Error('failed'); },
    onMutate: async input => ({ previous: input }),
    onError: async (_error, _input, rollback) => { rollbackValue = rollback?.previous; }
  });

  try {
    await mutation.mutate('before');
  } catch {
    // expected
  }

  equal(mutation.status(), 'error');
  equal(rollbackValue, 'before');
  assert(mutation.error() instanceof Error, 'mutation error should be stored');
});

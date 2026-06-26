import { createQueryClient, createMutationWithAfter, createQueryInvalidator } from '../../packages/query/dist/index.js';
import { test, equal } from './test-api.mjs';

test('query: invalidator matches exact keys and key prefixes', () => {
  const invalidated = [];
  const invalidator = createQueryInvalidator(key => invalidated.push(key));
  equal(invalidator.matches('users:1', 'users'), true);
  equal(invalidator.matches('orders:1', 'users'), false);
  invalidator.invalidate(['users', 'settings']);
  equal(invalidated.join(','), 'users,settings');
});

test('query: mutation after-success hook can invalidate queries', async () => {
  const query = createQueryClient(() => 1);
  query.set('users:1', { id: 1 }, { staleTime: 100 });
  const mutation = createMutationWithAfter(
    { mutationFn: async value => value },
    async () => query.invalidate('users:1')
  );
  await mutation.mutate({ id: 1 });
  equal(query.get('users:1')?.status(), 'idle');
});

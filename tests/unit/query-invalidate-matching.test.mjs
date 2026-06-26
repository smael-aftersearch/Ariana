import { createQueryClient } from '../../packages/query/dist/index.js';
import { test, equal } from './test-api.mjs';

test('query: invalidateMatching invalidates exact and prefixed keys', () => {
  const query = createQueryClient(() => 1);
  query.set('users', ['all'], { staleTime: 100 });
  query.set('users:1', { id: 1 }, { staleTime: 100 });
  query.set('orders:1', { id: 1 }, { staleTime: 100 });

  query.invalidateMatching('users');

  equal(query.get('users')?.status(), 'idle');
  equal(query.get('users:1')?.status(), 'idle');
  equal(query.get('orders:1')?.status(), 'success');
});

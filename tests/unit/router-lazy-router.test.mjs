import { createLazyRouter } from '../../packages/router/dist/index.js';
import { test, assert, equal } from './test-api.mjs';

test('router: createLazyRouter resolves routes before navigation', async () => {
  class LazyPage {}
  const router = await createLazyRouter([{ path: '/lazy', loadComponent: async () => LazyPage }]);
  const match = router.match('/lazy');
  assert(match, 'resolved lazy router should match route');
  equal(match.route.component, LazyPage);
});

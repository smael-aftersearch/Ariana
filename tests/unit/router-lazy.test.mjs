import { createRouter, resolveLazyRoute, resolveLazyRoutes } from '../../packages/router/dist/index.js';
import { test, equal, assert } from './test-api.mjs';

test('router: resolves a lazy route component', async () => {
  class LazyPage {}
  const route = await resolveLazyRoute({ path: '/lazy', loadComponent: async () => LazyPage });
  const router = createRouter([route]);
  const match = router.match('/lazy');
  assert(match, 'lazy route should match after resolution');
  equal(match.route.component, LazyPage);
});

test('router: resolves nested lazy routes', async () => {
  class Parent {}
  class Child {}
  const routes = await resolveLazyRoutes([
    { path: '/parent', loadComponent: async () => Parent, children: [{ path: 'child', loadComponent: async () => Child }] }
  ]);
  const router = createRouter(routes);
  const match = router.match('/parent/child');
  assert(match, 'nested lazy route should match after resolution');
  equal(match.route.component, Child);
});

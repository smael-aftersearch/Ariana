import { createRouter, matchRoutes } from '../../packages/router/dist/index.js';
import { test, assert, equal } from './test-runner.mjs';

class HomePage {}
class UserPage {}
class LoginPage {}
class AdminPage {}

test('router matches static and parameterized routes', () => {
  const routes = [
    { path: '/', component: HomePage },
    { path: '/users/:id', component: UserPage }
  ];
  const home = matchRoutes(routes, '/');
  assert(home !== undefined);
  equal(home.route.component, HomePage);
  const user = matchRoutes(routes, '/users/42');
  assert(user !== undefined);
  equal(user.params.id, '42');
});

test('router navigates and exposes current match', async () => {
  const router = createRouter([{ path: '/users/:id', component: UserPage }]);
  equal(router.link('users/7'), '/users/7');
  equal(await router.navigate('/users/7'), true);
  equal(router.currentPath(), '/users/7');
  equal(router.currentMatch()?.params.id, '7');
});

test('router guard can reject navigation', async () => {
  const router = createRouter([{ path: '/blocked', component: AdminPage, guards: [() => false] }]);
  equal(await router.navigate('/blocked'), false);
  equal(router.currentPath(), '/');
});

test('router guard can redirect navigation', async () => {
  const router = createRouter([
    { path: '/login', component: LoginPage },
    { path: '/admin', component: AdminPage, guards: [() => '/login'] }
  ]);
  equal(await router.navigate('/admin'), true);
  equal(router.currentPath(), '/login');
});

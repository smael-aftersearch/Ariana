import { createRouter, matchRoutes } from '../../packages/router/dist/index.js';
import { test, assert, equal, deepEqual } from './test-runner.mjs';

class HomePage {}
class UserPage {}
class LoginPage {}
class AdminPage {}
class SettingsPage {}

const parentProvider = { provide: Symbol.for('parent'), useValue: 'parent' };
const childProvider = { provide: Symbol.for('child'), useValue: 'child' };

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
  equal(await router.navigate('/users/7?tab=profile#top'), true);
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

test('router rejects redirect loops through maxRedirects', async () => {
  const router = createRouter([
    { path: '/a', component: HomePage, guards: [() => '/b'] },
    { path: '/b', component: HomePage, guards: [() => '/a'] }
  ], '/', { maxRedirects: 2 });
  equal(await router.navigate('/a'), false);
  equal(router.currentPath(), '/');
});

test('router inherits route data and providers from parents', async () => {
  const router = createRouter([
    {
      path: '/admin',
      component: AdminPage,
      data: { layout: 'admin', requiresAuth: true },
      providers: [parentProvider],
      children: [
        {
          path: 'settings',
          component: SettingsPage,
          data: { title: 'Settings' },
          providers: [childProvider]
        }
      ]
    }
  ]);

  const match = router.match('/admin/settings');
  assert(match !== undefined);
  deepEqual(match.data, { layout: 'admin', requiresAuth: true, title: 'Settings' });
  equal(match.providers.length, 2);

  equal(await router.navigate('/admin/settings'), true);
  deepEqual(router.currentData(), { layout: 'admin', requiresAuth: true, title: 'Settings' });
  equal(router.currentProviders().length, 2);
});

test('router executes parent guards before child guards', async () => {
  const calls = [];
  const router = createRouter([
    {
      path: '/admin',
      component: AdminPage,
      guards: [() => { calls.push('parent'); return true; }],
      children: [
        { path: 'settings', component: SettingsPage, guards: [() => { calls.push('child'); return true; }] }
      ]
    }
  ]);

  equal(await router.navigate('/admin/settings'), true);
  deepEqual(calls, ['parent', 'child']);
});

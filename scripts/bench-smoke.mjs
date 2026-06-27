import { performance } from 'node:perf_hooks';
import { computed, signal } from '../packages/core/dist/index.js';
import { createRouter } from '../packages/router/dist/index.js';
import { formArray, formControl } from '../packages/forms/dist/index.js';
import { createQueryClient } from '../packages/query/dist/index.js';

const results = [];

runCheck('core signal computed updates', 1500, () => {
  const value = signal(0);
  const double = computed(() => value() * 2);
  for (let index = 0; index < 20000; index++) value.set(index);
  if (double() !== 39998) throw new Error('core check failed');
});

runCheck('router repeated matching', 1500, () => {
  class Home {}
  class User {}
  const router = createRouter([{ path: '/', component: Home }, { path: '/users/:id', component: User }]);
  for (let index = 0; index < 15000; index++) {
    const match = router.match(`/users/${index}`);
    if (!match || match.params.id !== String(index)) throw new Error('router check failed');
  }
});

runCheck('forms array operations', 1500, () => {
  const array = formArray([]);
  for (let index = 0; index < 2000; index++) array.push(formControl(index));
  for (let index = 0; index < 50; index++) array.move(array.length() - 1, 0);
  if (array.length() !== 2000) throw new Error('forms check failed');
});

runCheck('query cache operations', 1500, () => {
  const query = createQueryClient(() => 1);
  for (let index = 0; index < 10000; index++) query.set(`users:${index}`, { id: index }, { staleTime: 1000 });
  query.invalidateMatching('users');
  if (query.get('users:1')?.status() !== 'idle') throw new Error('query check failed');
});

for (const result of results) console.log(`${result.name}: ${result.duration.toFixed(2)}ms`);

function runCheck(name, limitMs, callback) {
  const start = performance.now();
  callback();
  const duration = performance.now() - start;
  results.push({ name, duration });
  if (duration > limitMs) throw new Error(`${name} too slow: ${duration.toFixed(2)}ms > ${limitMs}ms`);
}

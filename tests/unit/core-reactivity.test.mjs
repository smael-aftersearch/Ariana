import { signal, computed, effect, listSignal } from '../../packages/core/dist/index.js';
import { test, assert, equal, deepEqual } from './test-api.mjs';

test('signal reads initial value and updates value', () => {
  const count = signal(1);
  equal(count(), 1);
  count.set(2);
  equal(count(), 2);
  count.update(value => value + 1);
  equal(count(), 3);
});

test('signal subscribers are notified and cleanup stops notifications', () => {
  const count = signal(0);
  let calls = 0;
  const cleanup = count.subscribe(() => calls++);
  count.set(1);
  equal(calls, 1);
  cleanup();
  count.set(2);
  equal(calls, 1);
});

test('computed tracks dependencies and recalculates', () => {
  const count = signal(2);
  const double = computed(() => count() * 2);
  equal(double(), 4);
  count.set(5);
  equal(double(), 10);
});

test('effect runs immediately and reruns on dependency update', () => {
  const count = signal(1);
  let observed = 0;
  const cleanup = effect(() => {
    observed = count();
  });
  equal(observed, 1);
  count.set(4);
  equal(observed, 4);
  cleanup();
  count.set(9);
  equal(observed, 4);
});

test('listSignal supports keyed read, update, insert, remove and clear', () => {
  const rows = listSignal([
    { id: 1, name: 'A' },
    { id: 2, name: 'B' }
  ], row => row.id);

  equal(rows.getByKey(1)?.name, 'A');
  equal(rows.indexOfKey(2), 1);

  rows.updateByKey(2, row => ({ ...row, name: 'B2' }));
  equal(rows.getByKey(2)?.name, 'B2');

  rows.insert({ id: 3, name: 'C' }, 1);
  equal(rows.indexOfKey(3), 1);
  deepEqual(rows().map(row => row.id), [1, 3, 2]);

  rows.removeByKey(1);
  deepEqual(rows().map(row => row.id), [3, 2]);

  rows.clear();
  equal(rows().length, 0);
});

test('listSignal emits targeted change events', () => {
  const rows = listSignal([{ id: 1, name: 'A' }], row => row.id);
  const changes = [];
  const cleanup = rows.subscribeChanges(change => changes.push(change.type));

  rows.updateByKey(1, row => ({ ...row, name: 'A2' }));
  rows.insert({ id: 2, name: 'B' });
  rows.removeByKey(2);
  rows.clear();
  cleanup();

  deepEqual(changes, ['update', 'insert', 'remove', 'clear']);
});

import { computed, effect, signal } from '../../packages/core/dist/index.js';
import { deepEqual, equal, test } from './test-api.mjs';

test('computed recomputes lazily on direct read after source update', () => {
  const value = signal(1);
  let runs = 0;
  const doubled = computed(() => {
    runs++;
    return value() * 2;
  });

  equal(runs, 0, 'computed should not run until it is read');
  equal(doubled(), 2, 'computed should return the initial derived value');
  equal(runs, 1, 'computed should run once for the initial read');

  value.set(2);
  equal(runs, 1, 'source update should only mark an unobserved computed dirty');
  equal(doubled(), 4, 'computed should refresh when read after source update');
  equal(runs, 2, 'computed should recompute exactly once after dirty read');
});

test('computed chains propagate correct values through lazy reads', () => {
  const value = signal(2);
  const doubled = computed(() => value() * 2);
  const plusOne = computed(() => doubled() + 1);

  equal(plusOne(), 5, 'computed chain should resolve initial value');
  value.set(4);
  equal(plusOne(), 9, 'computed chain should refresh after source update');
});

test('computed updates conditional dependencies when branch changes', () => {
  const usePrimary = signal(true);
  const primary = signal(1);
  const secondary = signal(10);
  const selected = computed(() => usePrimary() ? primary() : secondary());

  equal(selected(), 1, 'computed should read the initial branch');

  usePrimary.set(false);
  equal(selected(), 10, 'computed should switch to the secondary branch');

  primary.set(2);
  equal(selected(), 10, 'old branch updates should not affect the selected value');

  secondary.set(11);
  equal(selected(), 11, 'new branch updates should affect the selected value');
});

test('effects observe lazy computed invalidation and rerun with current values', () => {
  const value = signal(1);
  const doubled = computed(() => value() * 2);
  const seen = [];

  const dispose = effect(() => {
    seen.push(doubled());
  });

  value.set(2);
  value.set(3);
  dispose();
  value.set(4);

  deepEqual(seen, [2, 4, 6], 'effect should observe every computed invalidation before disposal');
});

test('effect cleanup runs before rerun and on dispose', () => {
  const value = signal(1);
  const events = [];

  const dispose = effect(() => {
    const current = value();
    events.push(`run:${current}`);
    return () => events.push(`cleanup:${current}`);
  });

  value.set(2);
  dispose();
  value.set(3);

  deepEqual(events, ['run:1', 'cleanup:1', 'run:2', 'cleanup:2'], 'effect cleanup lifecycle should remain stable');
});

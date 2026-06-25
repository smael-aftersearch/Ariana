import { formControl, formGroup, required, minLength } from '../../packages/forms/dist/index.js';
import { createQueryClient } from '../../packages/query/dist/index.js';
import { test, assert, equal } from './test-runner.mjs';

test('forms: formControl validates and tracks dirty/touched state', () => {
  const control = formControl('', [required(), minLength(3)]);
  equal(control.valid(), false);
  assert(control.errors()?.required !== undefined);

  control.setValue('abc');
  equal(control.value(), 'abc');
  equal(control.valid(), true);
  equal(control.dirty(), true);

  control.markTouched();
  equal(control.touched(), true);

  control.reset();
  equal(control.value(), '');
  equal(control.dirty(), false);
  equal(control.touched(), false);
});

test('forms: formGroup aggregates value, validity and patch updates', () => {
  const group = formGroup({
    name: formControl('', [required()]),
    email: formControl('a@example.com')
  });

  equal(group.valid(), false);
  group.patchValue({ name: 'Ariana' });
  equal(group.valid(), true);
  equal(group.value().name, 'Ariana');
  equal(group.value().email, 'a@example.com');
});

test('query: set/get/invalidate/clear update query state', () => {
  let time = 100;
  const client = createQueryClient(() => time++);
  const state = client.set('user:1', { id: 1 }, { staleTime: 10 });

  equal(client.size(), 1);
  equal(client.get('user:1')?.data()?.id, 1);
  equal(state.status(), 'success');
  equal(state.updatedAt(), 100);
  equal(state.staleAt(), 110);
  equal(client.isStale('user:1'), false);

  client.invalidate('user:1');
  equal(state.status(), 'idle');
  equal(client.isStale('user:1'), true);

  client.clear();
  equal(client.size(), 0);
});

test('query: fetch sets success and error states', async () => {
  const client = createQueryClient(() => 1);
  const data = await client.fetch('ok', async () => 'done');
  equal(data, 'done');
  equal(client.get('ok')?.status(), 'success');
  equal(client.get('ok')?.data(), 'done');

  try {
    await client.fetch('fail', async () => { throw new Error('boom'); });
    throw new Error('expected query failure');
  } catch (error) {
    equal(client.get('fail')?.status(), 'error');
    assert(client.get('fail')?.error() instanceof Error);
  }
});

test('query: fetch deduplicates in-flight requests', async () => {
  const client = createQueryClient(() => 1);
  let calls = 0;
  const loader = async () => {
    calls++;
    return 'shared';
  };

  const [first, second] = await Promise.all([
    client.fetch('shared', loader, { force: true }),
    client.fetch('shared', loader, { force: true })
  ]);

  equal(first, 'shared');
  equal(second, 'shared');
  equal(calls, 1);
});

test('query: fetch retries failures before succeeding', async () => {
  const client = createQueryClient(() => 1);
  let calls = 0;
  const data = await client.fetch('retry', async () => {
    calls++;
    if (calls < 3) throw new Error('temporary');
    return 'ok';
  }, { retry: 2, force: true });

  equal(data, 'ok');
  equal(calls, 3);
  equal(client.get('retry')?.status(), 'success');
});

test('query: fetch passes cancellation signal to loader', async () => {
  const client = createQueryClient(() => 1);
  const controller = new AbortController();
  const data = await client.fetch('signal', async ({ signal }) => {
    equal(signal, controller.signal);
    return 'ok';
  }, { signal: controller.signal, force: true });

  equal(data, 'ok');
});

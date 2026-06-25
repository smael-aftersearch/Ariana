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
  const state = client.set('user:1', { id: 1 });

  equal(client.size(), 1);
  equal(client.get('user:1')?.data()?.id, 1);
  equal(state.status(), 'success');
  equal(state.updatedAt(), 100);

  client.invalidate('user:1');
  equal(state.status(), 'idle');

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

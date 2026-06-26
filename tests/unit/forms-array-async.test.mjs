import { formArray, formControl } from '../../packages/forms/dist/index.js';
import { test, equal, assert } from './test-api.mjs';

const notTaken = async value => value !== 'taken' ? undefined : { unique: 'notUnique' };

test('forms: array aggregates async child errors', async () => {
  const array = formArray([
    formControl('taken', { asyncValidators: [notTaken] }),
    formControl('free', { asyncValidators: [notTaken] })
  ]);

  const errors = await array.validateAsync();
  assert(errors, 'array should expose child async errors');
  equal(Boolean(errors?.[0]), true);
  equal(Boolean(errors?.[1]), false);
});

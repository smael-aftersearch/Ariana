import { formArray, formControl, required } from '../../packages/forms/dist/index.js';
import { test, equal, assert } from './test-api.mjs';

test('forms: formArray tracks value length and validity', () => {
  const first = formControl('one');
  const second = formControl('', [required()]);
  const array = formArray([first]);

  equal(array.length(), 1);
  equal(array.value()[0], 'one');
  array.push(second);
  equal(array.length(), 2);
  assert(!array.valid(), 'formArray should be invalid when a child is invalid');
  second.setValue('two');
  assert(array.valid(), 'formArray should become valid when children are valid');
});

test('forms: formArray removes and moves controls', () => {
  const array = formArray([formControl('a'), formControl('b'), formControl('c')]);
  array.removeAt(1);
  equal(array.value().join(','), 'a,c');
  array.move(1, 0);
  equal(array.value().join(','), 'c,a');
});

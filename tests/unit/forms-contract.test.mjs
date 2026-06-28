import { formArray, formControl } from '../../packages/forms/dist/index.js';
import { deepEqual, equal, test } from './test-api.mjs';

test('formArray controls snapshots remain stable', () => {
  const array = formArray([formControl(1)]);
  const snapshot = array.controls();

  array.push(formControl(2));

  equal(snapshot.length, 1, 'old snapshot should not change after push');
  equal(array.controls().length, 2, 'current controls should include pushed control');
});

test('formArray controls update receives a snapshot', () => {
  const array = formArray([formControl(1)]);
  let inputLength = 0;

  array.controls.update(controls => {
    inputLength = controls.length;
    return [...controls, formControl(2)];
  });

  equal(inputLength, 1, 'update should receive previous snapshot');
  equal(array.length(), 2, 'length should reflect updated controls');
});

test('formArray move keeps length and updates values', () => {
  const array = formArray([formControl(1), formControl(2), formControl(3)]);

  array.move(2, 0);

  equal(array.length(), 3, 'move should not change length');
  deepEqual(array.value(), [3, 1, 2], 'move should update value order');
});

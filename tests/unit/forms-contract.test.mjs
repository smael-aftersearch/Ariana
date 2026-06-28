import { formArray, formControl } from '../../packages/forms/dist/index.js';
import { deepEqual, equal, test } from './test-api.mjs';

test('validator-free formControl preserves core state behavior', async () => {
  const control = formControl(1);

  equal(control.value(), 1, 'initial value should be readable');
  equal(control.valid(), true, 'validator-free control should start valid');
  equal(control.errors(), undefined, 'validator-free control should have no errors');
  equal(control.pending(), false, 'validator-free control should not be pending');
  equal(control.dirty(), false, 'control should start clean');
  equal(control.touched(), false, 'control should start untouched');

  control.setValue(2);
  equal(control.value(), 2, 'setValue should update value');
  equal(control.dirty(), true, 'setValue should mark dirty when value changes');

  control.markTouched();
  equal(control.touched(), true, 'markTouched should mark control touched');

  const validationResult = await control.validateAsync();
  equal(validationResult, undefined, 'validator-free validateAsync should resolve without errors');
  equal(control.errors(), undefined, 'validator-free validateAsync should keep errors empty');

  control.reset();
  equal(control.value(), 1, 'reset should restore initial value');
  equal(control.dirty(), false, 'reset should clear dirty');
  equal(control.touched(), false, 'reset should clear touched');
  equal(control.pending(), false, 'reset should clear pending');
});

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

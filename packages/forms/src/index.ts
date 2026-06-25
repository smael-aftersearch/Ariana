import { computed, signal } from '@ariana/core';
import type { Signal } from '@ariana/core';

export type ValidationErrors = Record<string, unknown>;
export type Validator<T> = (value: T) => ValidationErrors | undefined;

export type FormControl<T> = {
  readonly value: Signal<T>;
  readonly touched: Signal<boolean>;
  readonly dirty: Signal<boolean>;
  readonly errors: Signal<ValidationErrors | undefined>;
  readonly valid: Signal<boolean>;
  setValue(value: T): void;
  patchValue(value: T): void;
  markTouched(): void;
  reset(value?: T): void;
};

export function formControl<T>(initialValue: T, validators: readonly Validator<T>[] = []): FormControl<T> {
  const value = signal(initialValue);
  const touched = signal(false);
  const dirty = signal(false);
  const errors = computed(() => mergeErrors(validators.map(validator => validator(value()))));
  const valid = computed(() => errors() === undefined);

  return {
    value,
    touched,
    dirty,
    errors,
    valid,
    setValue(nextValue) {
      if (!Object.is(value.peek(), nextValue)) {
        value.set(nextValue);
        dirty.set(true);
      }
    },
    patchValue(nextValue) { this.setValue(nextValue); },
    markTouched() { touched.set(true); },
    reset(nextValue = initialValue) {
      value.set(nextValue);
      touched.set(false);
      dirty.set(false);
    }
  };
}

export function formGroup<TShape extends Record<string, FormControl<unknown>>>(controls: TShape) {
  const value = computed(() => {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(controls)) result[key] = controls[key].value();
    return result;
  });
  const errors = computed(() => {
    const result: Record<string, ValidationErrors> = {};
    for (const key of Object.keys(controls)) {
      const controlErrors = controls[key].errors();
      if (controlErrors) result[key] = controlErrors;
    }
    return Object.keys(result).length === 0 ? undefined : result;
  });
  const valid = computed(() => errors() === undefined);
  return {
    controls,
    value,
    valid,
    errors,
    patchValue(nextValue: Record<string, unknown>) {
      for (const key of Object.keys(nextValue)) if (controls[key]) controls[key].patchValue(nextValue[key] as never);
    },
    markTouched() { for (const control of Object.values(controls)) control.markTouched(); },
    reset() { for (const control of Object.values(controls)) control.reset(); }
  };
}

export const required = <T>(message = 'required'): Validator<T> => value => value === undefined || value === null || value === '' ? { required: message } : undefined;
export const minLength = (length: number): Validator<string> => value => value.length < length ? { minLength: { requiredLength: length, actualLength: value.length } } : undefined;

function mergeErrors(errors: Array<ValidationErrors | undefined>): ValidationErrors | undefined {
  let result: ValidationErrors | undefined;
  for (const error of errors) if (error) result = { ...(result ?? {}), ...error };
  return result;
}

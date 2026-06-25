import { computed, signal } from '@ariana/core';
import type { Signal } from '@ariana/core';

export type ValidationErrors = Record<string, unknown>;
export type Validator<T> = (value: T) => ValidationErrors | undefined;
export type AsyncValidator<T> = (value: T) => Promise<ValidationErrors | undefined>;

export type FormControl<T> = {
  readonly value: Signal<T>;
  readonly touched: Signal<boolean>;
  readonly dirty: Signal<boolean>;
  readonly pending: Signal<boolean>;
  readonly errors: Signal<ValidationErrors | undefined>;
  readonly asyncErrors: Signal<ValidationErrors | undefined>;
  readonly valid: Signal<boolean>;
  setValue(value: T): void;
  patchValue(value: T): void;
  markTouched(): void;
  validateAsync(): Promise<ValidationErrors | undefined>;
  reset(value?: T): void;
};

export type FormControlOptions<T> = {
  validators?: readonly Validator<T>[];
  asyncValidators?: readonly AsyncValidator<T>[];
};

export function formControl<T>(initialValue: T, validatorsOrOptions: readonly Validator<T>[] | FormControlOptions<T> = []): FormControl<T> {
  const validators = Array.isArray(validatorsOrOptions) ? validatorsOrOptions : validatorsOrOptions.validators ?? [];
  const asyncValidators = Array.isArray(validatorsOrOptions) ? [] : validatorsOrOptions.asyncValidators ?? [];
  const value = signal(initialValue);
  const touched = signal(false);
  const dirty = signal(false);
  const pending = signal(false);
  const asyncErrors = signal<ValidationErrors | undefined>(undefined);
  const errors = computed(() => mergeErrors([mergeErrors(validators.map(validator => validator(value()))), asyncErrors()]));
  const valid = computed(() => errors() === undefined && !pending());
  let asyncRunId = 0;

  async function validateAsync() {
    if (asyncValidators.length === 0) {
      asyncErrors.set(undefined);
      return undefined;
    }

    const runId = ++asyncRunId;
    pending.set(true);

    try {
      const result = mergeErrors(await Promise.all(asyncValidators.map(validator => validator(value.peek()))));
      if (runId === asyncRunId) asyncErrors.set(result);
      return result;
    } finally {
      if (runId === asyncRunId) pending.set(false);
    }
  }

  return {
    value,
    touched,
    dirty,
    pending,
    errors,
    asyncErrors,
    valid,
    setValue(nextValue) {
      if (!Object.is(value.peek(), nextValue)) {
        value.set(nextValue);
        dirty.set(true);
        asyncErrors.set(undefined);
      }
    },
    patchValue(nextValue) { this.setValue(nextValue); },
    markTouched() { touched.set(true); },
    validateAsync,
    reset(nextValue = initialValue) {
      asyncRunId++;
      value.set(nextValue);
      touched.set(false);
      dirty.set(false);
      pending.set(false);
      asyncErrors.set(undefined);
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
  const pending = computed(() => Object.values(controls).some(control => control.pending()));
  const valid = computed(() => errors() === undefined && !pending());
  return {
    controls,
    value,
    valid,
    pending,
    errors,
    patchValue(nextValue: Record<string, unknown>) {
      for (const key of Object.keys(nextValue)) if (controls[key]) controls[key].patchValue(nextValue[key] as never);
    },
    markTouched() { for (const control of Object.values(controls)) control.markTouched(); },
    async validateAsync() {
      const entries = await Promise.all(Object.entries(controls).map(async ([key, control]) => [key, await control.validateAsync()] as const));
      const result: Record<string, ValidationErrors> = {};
      for (const [key, controlErrors] of entries) if (controlErrors) result[key] = controlErrors;
      return Object.keys(result).length === 0 ? undefined : result;
    },
    reset() { for (const control of Object.values(controls)) control.reset(); }
  };
}

export const required = <T>(message = 'required'): Validator<T> => value => value === undefined || value === null || value === '' ? { required: message } : undefined;
export const minLength = (length: number): Validator<string> => value => value.length < length ? { minLength: { requiredLength: length, actualLength: value.length } } : undefined;

export function asyncUnique<T>(isUnique: (value: T) => Promise<boolean>, message = 'notUnique'): AsyncValidator<T> {
  return async value => await isUnique(value) ? undefined : { unique: message };
}

function mergeErrors(errors: Array<ValidationErrors | undefined>): ValidationErrors | undefined {
  let result: ValidationErrors | undefined;
  for (const error of errors) if (error) result = { ...(result ?? {}), ...error };
  return result;
}

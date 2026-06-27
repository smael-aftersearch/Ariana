import { signal } from '@ariana-framework/core';
import type { Cleanup, Signal, Subscriber } from '@ariana-framework/core';
import type { FormControl, ValidationErrors } from './index.js';

export type FormArray<T> = {
  readonly controls: Signal<readonly FormControl<T>[]>;
  readonly value: Signal<readonly T[]>;
  readonly length: Signal<number>;
  readonly valid: Signal<boolean>;
  readonly pending: Signal<boolean>;
  readonly errors: Signal<ValidationErrors | undefined>;
  push(control: FormControl<T>): void;
  removeAt(index: number): void;
  move(from: number, to: number): void;
  validateAsync(): Promise<ValidationErrors | undefined>;
  reset(): void;
};

export function formArray<T>(initialControls: readonly FormControl<T>[] = []): FormArray<T> {
  const store: FormControl<T>[] = [...initialControls];
  const version = signal(0);
  const length = signal(store.length);
  const controls = readonlyVersionedSignal(() => store, version);
  const value = readonlyVersionedSignal(() => store.map(control => control.value()), version);
  const pending = readonlyVersionedSignal(() => store.some(control => control.pending()), version);
  const errors = readonlyVersionedSignal(() => collectErrors(store), version);
  const valid = readonlyVersionedSignal(() => errors() === undefined && !pending(), version);

  controls.set = nextControls => {
    store.length = 0;
    store.push(...nextControls);
    length.set(store.length);
    version.update(current => current + 1);
  };

  controls.update = updater => controls.set(updater(store));

  return {
    controls,
    value,
    length,
    valid,
    pending,
    errors,
    push(control: FormControl<T>) {
      store.push(control);
      length.set(store.length);
      version.update(current => current + 1);
    },
    removeAt(index: number) {
      if (index < 0 || index >= store.length) return;
      store.splice(index, 1);
      length.set(store.length);
      version.update(current => current + 1);
    },
    move(from: number, to: number) {
      if (from === to || from < 0 || from >= store.length || to < 0 || to >= store.length) return;
      const [control] = store.splice(from, 1);
      if (!control) return;
      store.splice(to, 0, control);
      version.update(current => current + 1);
    },
    async validateAsync() {
      await Promise.all(store.map(control => control.validateAsync()));
      return collectErrors(store);
    },
    reset() {
      for (const control of store) control.reset();
    }
  };
}

function readonlyVersionedSignal<T>(readValue: () => T, version: Signal<number>): Signal<T> {
  const subscribers = new Set<Subscriber>();

  const read = (() => {
    version();
    return readValue();
  }) as Signal<T>;

  read.set = () => {};
  read.update = () => {};
  read.peek = readValue;
  read.subscribe = (subscriber: Subscriber): Cleanup => {
    subscribers.add(subscriber);
    const unsubscribe = version.subscribe(subscriber);
    return () => {
      subscribers.delete(subscriber);
      unsubscribe();
    };
  };

  return read;
}

function collectErrors<T>(controls: readonly FormControl<T>[]): ValidationErrors | undefined {
  let result: ValidationErrors | undefined;

  for (let index = 0; index < controls.length; index++) {
    const controlErrors = controls[index].errors();
    if (controlErrors) result = { ...(result ?? {}), [index]: controlErrors };
  }

  return result;
}

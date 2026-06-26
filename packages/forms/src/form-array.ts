import { computed, signal } from '@ariana-framework/core';
import type { Signal } from '@ariana-framework/core';
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
  const controls = signal<readonly FormControl<T>[]>([...initialControls]);
  const value = computed(() => controls().map(control => control.value()));
  const length = computed(() => controls().length);
  const pending = computed(() => controls().some(control => control.pending()));
  const errors = computed(() => collectErrors(controls()));
  const valid = computed(() => errors() === undefined && !pending());

  return {
    controls,
    value,
    length,
    valid,
    pending,
    errors,
    push(control: FormControl<T>) {
      controls.set([...controls.peek(), control]);
    },
    removeAt(index: number) {
      controls.set(controls.peek().filter((_, currentIndex) => currentIndex !== index));
    },
    move(from: number, to: number) {
      const next = [...controls.peek()];
      const [control] = next.splice(from, 1);
      if (!control) return;
      next.splice(to, 0, control);
      controls.set(next);
    },
    async validateAsync() {
      await Promise.all(controls.peek().map(control => control.validateAsync()));
      return collectErrors(controls.peek());
    },
    reset() {
      for (const control of controls.peek()) control.reset();
    }
  };
}

function collectErrors<T>(controls: readonly FormControl<T>[]): ValidationErrors | undefined {
  const result: ValidationErrors = {};
  controls.forEach((control, index) => {
    const controlErrors = control.errors();
    if (controlErrors) result[index] = controlErrors;
  });
  return Object.keys(result).length === 0 ? undefined : result;
}

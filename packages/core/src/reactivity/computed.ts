import { effect } from './effect.js';
import { signal } from './signal.js';
import type { Signal } from './types.js';

export function computed<T>(callback: () => T): Signal<T> {
  const value = signal<T>(undefined as T);

  effect(() => {
    value.set(callback());
  });

  return value;
}

import { getActiveComputation, ReactiveComputation } from './runtime.js';
import type { Cleanup, Signal, Subscriber } from './types.js';

export function computed<T>(callback: () => T): Signal<T> {
  let value: T;
  let hasValue = false;
  let dirty = true;
  const listeners = new Set<Subscriber>();

  const computation = new ReactiveComputation(() => {
    const nextValue = callback();
    dirty = false;

    if (hasValue && Object.is(value, nextValue)) return;

    value = nextValue;
    hasValue = true;
  }, markDirty);

  const read = (() => {
    const active = getActiveComputation();

    if (active) active.track(dependency);
    if (dirty || !hasValue) computation.run();

    return value;
  }) as Signal<T>;

  const dependency = { subscribe: (listener: Subscriber): Cleanup => read.subscribe(listener) };

  read.set = (nextValue: T) => {
    dirty = false;

    if (hasValue && Object.is(value, nextValue)) return;

    value = nextValue;
    hasValue = true;
    notifyListeners();
  };

  read.update = updater => read.set(updater(read.peek()));
  read.peek = () => {
    if (dirty || !hasValue) computation.run();
    return value;
  };
  read.subscribe = (listener: Subscriber): Cleanup => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  function markDirty() {
    if (dirty) return;
    dirty = true;
    if (listeners.size === 0) return;
    notifyListeners();
  }

  function notifyListeners() {
    if (listeners.size === 0) return;
    if (listeners.size === 1) {
      const listener = listeners.values().next().value;
      listener();
      return;
    }
    const snapshot = Array.from(listeners);
    for (let index = 0; index < snapshot.length; index++) snapshot[index]();
  }

  return read;
}

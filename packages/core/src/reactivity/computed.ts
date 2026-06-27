import { getActiveComputation, ReactiveComputation } from './runtime.js';
import type { Cleanup, Signal, Subscriber } from './types.js';

export function computed<T>(callback: () => T): Signal<T> {
  let value: T;
  let hasValue = false;
  const listeners = new Set<Subscriber>();

  const computation = new ReactiveComputation(() => {
    const nextValue = callback();

    if (hasValue && Object.is(value, nextValue)) {
      return;
    }

    value = nextValue;
    hasValue = true;

    if (listeners.size === 0) {
      return;
    }

    const snapshot = Array.from(listeners);
    for (let index = 0; index < snapshot.length; index++) {
      snapshot[index]();
    }
  });

  const read = (() => {
    const active = getActiveComputation();

    if (active) {
      active.track(dependency);
    }

    if (!hasValue) {
      computation.run();
    }

    return value;
  }) as Signal<T>;

  const dependency = { subscribe: (listener: Subscriber): Cleanup => read.subscribe(listener) };

  read.set = (nextValue: T) => {
    if (hasValue && Object.is(value, nextValue)) {
      return;
    }

    value = nextValue;
    hasValue = true;

    if (listeners.size === 0) {
      return;
    }

    const snapshot = Array.from(listeners);
    for (let index = 0; index < snapshot.length; index++) {
      snapshot[index]();
    }
  };

  read.update = updater => read.set(updater(read.peek()));
  read.peek = () => {
    if (!hasValue) {
      computation.run();
    }

    return value;
  };
  read.subscribe = (listener: Subscriber): Cleanup => {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  };

  computation.run();
  return read;
}

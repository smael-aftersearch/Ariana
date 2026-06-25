import { getActiveComputation } from './runtime.js';
import type { Cleanup, Signal, Subscriber } from './types.js';

export function signal<T>(initialValue: T): Signal<T> {
  let value = initialValue;
  const subscribers = new Set<Subscriber>();

  const read = (() => {
    const active = getActiveComputation();

    if (active) {
      active.track({ subscribe: read.subscribe });
    }

    return value;
  }) as Signal<T>;

  read.set = (nextValue: T) => {
    if (Object.is(value, nextValue)) {
      return;
    }

    value = nextValue;

    for (const subscriber of Array.from(subscribers)) {
      subscriber();
    }
  };

  read.update = (updater: (value: T) => T) => {
    read.set(updater(value));
  };

  read.peek = () => value;

  read.subscribe = (subscriber: Subscriber): Cleanup => {
    subscribers.add(subscriber);

    return () => {
      subscribers.delete(subscriber);
    };
  };

  return read;
}

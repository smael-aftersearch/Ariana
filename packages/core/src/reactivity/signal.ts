import { getActiveComputation } from './runtime.js';
import type { Signal, Subscriber } from './types.js';

export function signal<T>(initialValue: T): Signal<T> {
  let value = initialValue;
  const subscribers = new Set<Subscriber>();

  const read = (() => {
    const computation = getActiveComputation();

    if (computation) {
      subscribers.add(() => computation.run());
      computation.track({
        delete(subscriber) {
          subscribers.delete(() => subscriber.run());
        }
      });
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

  read.subscribe = (subscriber: Subscriber) => {
    subscribers.add(subscriber);

    return () => {
      subscribers.delete(subscriber);
    };
  };

  return read;
}

import { getActiveComputation } from './runtime.js';
import type { Cleanup, Signal, Subscriber } from './types.js';

export function signal<T>(initialValue: T): Signal<T> {
  let value = initialValue;
  const subscribers = new Set<Subscriber>();
  const notificationQueue: Subscriber[] = [];
  let notificationDepth = 0;

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
    notifySubscribers();
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

  function notifySubscribers() {
    if (subscribers.size === 0) {
      return;
    }

    if (subscribers.size === 1 && notificationDepth === 0) {
      subscribers.values().next().value?.();
      return;
    }

    const queue = notificationDepth === 0 ? notificationQueue : Array.from(subscribers);

    if (notificationDepth === 0) {
      queue.length = 0;
      for (const subscriber of subscribers) {
        queue.push(subscriber);
      }
    }

    notificationDepth++;

    try {
      for (let index = 0; index < queue.length; index++) {
        queue[index]();
      }
    } finally {
      notificationDepth--;

      if (notificationDepth === 0) {
        notificationQueue.length = 0;
      }
    }
  }

  return read;
}

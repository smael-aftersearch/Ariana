import { getActiveComputation } from './runtime.js';
import type { Cleanup, Signal, Subscriber } from './types.js';

export type ListKey = string | number | symbol;

export type ListChange<T, K extends ListKey> =
  | { type: 'set'; items: readonly T[] }
  | { type: 'update'; key: K; index: number; item: T; previousItem: T }
  | { type: 'insert'; key: K; index: number; item: T }
  | { type: 'remove'; key: K; index: number; previousItem: T }
  | { type: 'clear' };

export type ListChangeSubscriber<T, K extends ListKey> = (change: ListChange<T, K>) => void;

export type ListSignal<T, K extends ListKey = ListKey> = Signal<readonly T[]> & {
  keyOf(item: T, index: number): K;
  getByKey(key: K): T | undefined;
  indexOfKey(key: K): number;
  updateByKey(key: K, updater: (item: T) => T): void;
  insert(item: T, index?: number): void;
  removeByKey(key: K): void;
  clear(): void;
  subscribeChanges(subscriber: ListChangeSubscriber<T, K>): Cleanup;
};

export function listSignal<T, K extends ListKey>(
  initialItems: readonly T[],
  keyOf: (item: T, index: number) => K
): ListSignal<T, K> {
  let items = [...initialItems];
  const subscribers = new Set<Subscriber>();
  const changeSubscribers = new Set<ListChangeSubscriber<T, K>>();
  let indexByKey = buildIndex(items, keyOf);

  const read = (() => {
    const active = getActiveComputation();

    if (active) {
      active.track({ subscribe: read.subscribe });
    }

    return items;
  }) as unknown as ListSignal<T, K>;

  read.keyOf = keyOf;

  read.set = (nextItems: readonly T[]) => {
    if (Object.is(items, nextItems)) {
      return;
    }

    items = [...nextItems];
    indexByKey = buildIndex(items, keyOf);
    notifyCollection();
    notifyChange({ type: 'set', items });
  };

  read.update = (updater: (value: readonly T[]) => readonly T[]) => {
    read.set(updater(items));
  };

  read.peek = () => items;

  read.subscribe = (subscriber: Subscriber): Cleanup => {
    subscribers.add(subscriber);

    return () => {
      subscribers.delete(subscriber);
    };
  };

  read.subscribeChanges = (subscriber: ListChangeSubscriber<T, K>): Cleanup => {
    changeSubscribers.add(subscriber);

    return () => {
      changeSubscribers.delete(subscriber);
    };
  };

  read.getByKey = (key: K) => {
    const index = indexByKey.get(key);
    return index === undefined ? undefined : items[index];
  };

  read.indexOfKey = (key: K) => indexByKey.get(key) ?? -1;

  read.updateByKey = (key: K, updater: (item: T) => T) => {
    const index = indexByKey.get(key);

    if (index === undefined) {
      return;
    }

    const previousItem = items[index];
    const nextItem = updater(previousItem);

    if (Object.is(previousItem, nextItem)) {
      return;
    }

    items = items.slice();
    items[index] = nextItem;

    const nextKey = keyOf(nextItem, index);
    if (!Object.is(nextKey, key)) {
      indexByKey.delete(key);
      indexByKey.set(nextKey, index);
    }

    notifyCollection();
    notifyChange({ type: 'update', key: nextKey, index, item: nextItem, previousItem });
  };

  read.insert = (item: T, index = items.length) => {
    const safeIndex = Math.max(0, Math.min(index, items.length));
    const nextItems = items.slice();
    nextItems.splice(safeIndex, 0, item);
    items = nextItems;
    indexByKey = buildIndex(items, keyOf);
    notifyCollection();
    notifyChange({ type: 'insert', key: keyOf(item, safeIndex), index: safeIndex, item });
  };

  read.removeByKey = (key: K) => {
    const index = indexByKey.get(key);

    if (index === undefined) {
      return;
    }

    const previousItem = items[index];
    const nextItems = items.slice();
    nextItems.splice(index, 1);
    items = nextItems;
    indexByKey = buildIndex(items, keyOf);
    notifyCollection();
    notifyChange({ type: 'remove', key, index, previousItem });
  };

  read.clear = () => {
    if (items.length === 0) {
      return;
    }

    items = [];
    indexByKey = new Map();
    notifyCollection();
    notifyChange({ type: 'clear' });
  };

  function notifyCollection() {
    for (const subscriber of Array.from(subscribers)) {
      subscriber();
    }
  }

  function notifyChange(change: ListChange<T, K>) {
    for (const subscriber of Array.from(changeSubscribers)) {
      subscriber(change);
    }
  }

  return read;
}

function buildIndex<T, K extends ListKey>(
  items: readonly T[],
  keyOf: (item: T, index: number) => K
): Map<K, number> {
  const index = new Map<K, number>();

  items.forEach((item, position) => {
    index.set(keyOf(item, position), position);
  });

  return index;
}

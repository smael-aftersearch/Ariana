export type Cleanup = () => void;
export type Subscriber = () => void;

export type Signal<T> = {
  (): T;
  set(value: T): void;
  update(updater: (value: T) => T): void;
  peek(): T;
  subscribe(subscriber: Subscriber): Cleanup;
};

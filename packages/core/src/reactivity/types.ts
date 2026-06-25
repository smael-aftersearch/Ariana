export type Subscriber = () => void;
export type Cleanup = () => void;

export type Signal<T> = {
  (): T;
  set(value: T): void;
  update(updater: (value: T) => T): void;
  subscribe(subscriber: Subscriber): Cleanup;
};

import { signal } from '@ariana/core';
import type { Signal } from '@ariana/core';

export type QueryStatus = 'idle' | 'loading' | 'success' | 'error';

export type QueryState<T> = {
  readonly key: string;
  readonly data: Signal<T | undefined>;
  readonly error: Signal<unknown>;
  readonly status: Signal<QueryStatus>;
  readonly updatedAt: Signal<number>;
};

export type QueryClient = {
  get<T>(key: string): QueryState<T> | undefined;
  ensure<T>(key: string): QueryState<T>;
  set<T>(key: string, data: T): QueryState<T>;
  invalidate(key: string): void;
  clear(): void;
  fetch<T>(key: string, loader: () => Promise<T>): Promise<T>;
  size(): number;
};

export function createQueryClient(now: () => number = () => Date.now()): QueryClient {
  const cache = new Map<string, QueryState<unknown>>();

  function ensure<T>(key: string): QueryState<T> {
    const existing = cache.get(key);
    if (existing) return existing as QueryState<T>;
    const state: QueryState<T> = { key, data: signal<T | undefined>(undefined), error: signal<unknown>(undefined), status: signal<QueryStatus>('idle'), updatedAt: signal(0) };
    cache.set(key, state as QueryState<unknown>);
    return state;
  }

  return {
    get<T>(key: string) { return cache.get(key) as QueryState<T> | undefined; },
    ensure,
    set<T>(key: string, data: T) {
      const state = ensure<T>(key);
      state.data.set(data);
      state.error.set(undefined);
      state.status.set('success');
      state.updatedAt.set(now());
      return state;
    },
    invalidate(key: string) {
      const state = cache.get(key);
      if (state) state.status.set('idle');
    },
    clear() { cache.clear(); },
    async fetch<T>(key: string, loader: () => Promise<T>) {
      const state = ensure<T>(key);
      state.status.set('loading');
      try {
        const data = await loader();
        state.data.set(data);
        state.error.set(undefined);
        state.status.set('success');
        state.updatedAt.set(now());
        return data;
      } catch (error) {
        state.error.set(error);
        state.status.set('error');
        throw error;
      }
    },
    size() { return cache.size; }
  };
}

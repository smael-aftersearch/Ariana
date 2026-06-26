import { signal } from '@ariana/core';
import type { Signal } from '@ariana/core';
import type { QueryInvalidationTarget } from './invalidation.js';

export type QueryStatus = 'idle' | 'loading' | 'success' | 'error';

export type QueryState<T> = {
  readonly key: string;
  readonly data: Signal<T | undefined>;
  readonly error: Signal<unknown>;
  readonly status: Signal<QueryStatus>;
  readonly updatedAt: Signal<number>;
  readonly staleAt: Signal<number>;
};

export type QueryFetchOptions = {
  staleTime?: number;
  retry?: number;
  signal?: AbortSignal;
  force?: boolean;
};

export type QueryClient = {
  get<T>(key: string): QueryState<T> | undefined;
  ensure<T>(key: string): QueryState<T>;
  set<T>(key: string, data: T, options?: { staleTime?: number }): QueryState<T>;
  isStale(key: string): boolean;
  invalidate(key: string): void;
  invalidateMatching(target: QueryInvalidationTarget): void;
  clear(): void;
  fetch<T>(key: string, loader: (context: { signal?: AbortSignal }) => Promise<T>, options?: QueryFetchOptions): Promise<T>;
  size(): number;
};

export function createQueryClient(now: () => number = () => Date.now()): QueryClient {
  const cache = new Map<string, QueryState<unknown>>();
  const inFlight = new Map<string, Promise<unknown>>();

  function ensure<T>(key: string): QueryState<T> {
    const existing = cache.get(key);
    if (existing) return existing as QueryState<T>;
    const state: QueryState<T> = {
      key,
      data: signal<T | undefined>(undefined),
      error: signal<unknown>(undefined),
      status: signal<QueryStatus>('idle'),
      updatedAt: signal(0),
      staleAt: signal(0)
    };
    cache.set(key, state as QueryState<unknown>);
    return state;
  }

  function set<T>(key: string, data: T, options: { staleTime?: number } = {}) {
    const state = ensure<T>(key);
    const timestamp = now();
    state.data.set(data);
    state.error.set(undefined);
    state.status.set('success');
    state.updatedAt.set(timestamp);
    state.staleAt.set(timestamp + (options.staleTime ?? 0));
    return state;
  }

  function isStale(key: string): boolean {
    const state = cache.get(key);
    if (!state || state.status() !== 'success') return true;
    return state.staleAt() <= now();
  }

  function invalidate(key: string) {
    const state = cache.get(key);
    if (state) {
      state.status.set('idle');
      state.staleAt.set(0);
    }
  }

  function invalidateMatching(target: QueryInvalidationTarget) {
    const targets = typeof target === 'string' ? [target] : target;
    for (const key of cache.keys()) {
      if (targets.some(prefix => key === prefix || key.startsWith(`${prefix}:`))) invalidate(key);
    }
  }

  return {
    get<T>(key: string) { return cache.get(key) as QueryState<T> | undefined; },
    ensure,
    set,
    isStale,
    invalidate,
    invalidateMatching,
    clear() {
      cache.clear();
      inFlight.clear();
    },
    async fetch<T>(key: string, loader: (context: { signal?: AbortSignal }) => Promise<T>, options: QueryFetchOptions = {}) {
      const state = ensure<T>(key);

      if (!options.force && state.status() === 'success' && !isStale(key)) {
        return state.data() as T;
      }

      const existing = inFlight.get(key);
      if (existing) return existing as Promise<T>;

      const promise = runWithRetry(() => loader({ signal: options.signal }), options.retry ?? 0);
      inFlight.set(key, promise);
      state.status.set('loading');
      state.error.set(undefined);

      try {
        const data = await promise;
        set(key, data, { staleTime: options.staleTime });
        return data;
      } catch (error) {
        state.error.set(error);
        state.status.set('error');
        throw error;
      } finally {
        inFlight.delete(key);
      }
    },
    size() { return cache.size; }
  };
}

async function runWithRetry<T>(loader: () => Promise<T>, retry: number): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await loader();
    } catch (error) {
      if (attempt >= retry) throw error;
      attempt++;
    }
  }
}

export { createMutation } from './mutation.js';
export type { Mutation, MutationOptions, MutationStatus } from './mutation.js';
export { createMutationWithAfter } from './mutation-hooks.js';
export type { AfterMutation } from './mutation-hooks.js';
export { createQueryInvalidator } from './invalidation.js';
export type { QueryInvalidationTarget, QueryInvalidator } from './invalidation.js';

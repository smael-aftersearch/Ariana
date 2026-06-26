import type { Cleanup } from './types.js';

export type CleanupScope = {
  add(cleanup: Cleanup): Cleanup;
  run<T>(callback: () => T): T;
  cleanup(): void;
  readonly size: number;
};

export function createCleanupScope(): CleanupScope {
  const cleanups = new Set<Cleanup>();

  function add(cleanup: Cleanup): Cleanup {
    cleanups.add(cleanup);
    return () => {
      if (cleanups.delete(cleanup)) cleanup();
    };
  }

  return {
    add,
    run<T>(callback: () => T): T { return callback(); },
    cleanup() {
      for (const cleanup of Array.from(cleanups)) {
        cleanups.delete(cleanup);
        cleanup();
      }
    },
    get size() { return cleanups.size; }
  };
}

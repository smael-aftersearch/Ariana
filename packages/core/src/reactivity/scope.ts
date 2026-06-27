import type { Cleanup } from './types.js';

export type CleanupScope = {
  add(cleanup: Cleanup): Cleanup;
  child(): CleanupScope;
  run<T>(callback: () => T): T;
  cleanup(): void;
  readonly size: number;
  readonly cleaned: boolean;
};

export function createCleanupScope(): CleanupScope {
  const cleanups = new Set<Cleanup>();
  let cleaned = false;

  function add(cleanup: Cleanup): Cleanup {
    if (cleaned) {
      cleanup();
      return () => {};
    }

    cleanups.add(cleanup);
    return () => {
      if (cleanups.delete(cleanup)) cleanup();
    };
  }

  function cleanup() {
    if (cleaned) return;
    cleaned = true;
    for (const cleanup of Array.from(cleanups)) {
      cleanups.delete(cleanup);
      cleanup();
    }
  }

  const scope: CleanupScope = {
    add,
    child() {
      const childScope = createCleanupScope();
      add(() => childScope.cleanup());
      return childScope;
    },
    run<T>(callback: () => T): T { return callback(); },
    cleanup,
    get size() { return cleanups.size; },
    get cleaned() { return cleaned; }
  };

  return scope;
}

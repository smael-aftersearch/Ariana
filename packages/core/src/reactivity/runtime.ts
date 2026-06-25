import type { Cleanup } from './types.js';

export type Dependency = {
  delete(subscriber: ReactiveComputation): void;
};

let activeComputation: ReactiveComputation | undefined;

export function getActiveComputation() {
  return activeComputation;
}

export class ReactiveComputation {
  private readonly dependencies = new Set<Dependency>();

  constructor(private readonly callback: () => void) {}

  run() {
    this.cleanup();

    const previous = activeComputation;
    activeComputation = this;

    try {
      this.callback();
    } finally {
      activeComputation = previous;
    }
  }

  track(dependency: Dependency) {
    this.dependencies.add(dependency);
  }

  cleanup(): Cleanup {
    for (const dependency of this.dependencies) {
      dependency.delete(this);
    }

    this.dependencies.clear();

    return () => undefined;
  }
}

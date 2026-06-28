import type { Cleanup } from './types.js';

export type Dependency = {
  subscribe(subscriber: () => void): Cleanup;
};

export class ReactiveComputation {
  private cleanups = new Map<Dependency, Cleanup>();
  private dependencies = new Set<Dependency>();
  private nextDependencies = new Set<Dependency>();

  constructor(
    private readonly callback: () => void,
    private readonly scheduler: () => void = () => this.run()
  ) {}

  run = () => {
    this.nextDependencies.clear();
    pushComputation(this);

    try {
      this.callback();
    } finally {
      popComputation();
      this.reconcileDependencies();
    }
  };

  track(dependency: Dependency) {
    this.nextDependencies.add(dependency);

    if (this.dependencies.has(dependency)) {
      return;
    }

    this.dependencies.add(dependency);
    this.cleanups.set(dependency, dependency.subscribe(this.scheduler));
  }

  cleanup() {
    for (const cleanup of this.cleanups.values()) {
      cleanup();
    }

    this.cleanups.clear();
    this.dependencies.clear();
    this.nextDependencies.clear();
  }

  private reconcileDependencies() {
    for (const dependency of this.dependencies) {
      if (this.nextDependencies.has(dependency)) {
        continue;
      }

      this.cleanups.get(dependency)?.();
      this.cleanups.delete(dependency);
      this.dependencies.delete(dependency);
    }
  }
}

const stack: ReactiveComputation[] = [];

export function getActiveComputation(): ReactiveComputation | undefined {
  return stack[stack.length - 1];
}

function pushComputation(computation: ReactiveComputation) {
  stack.push(computation);
}

function popComputation() {
  stack.pop();
}

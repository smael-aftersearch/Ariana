import type { Cleanup } from './types.js';

export type Dependency = {
  subscribe(subscriber: () => void): Cleanup;
};

export class ReactiveComputation {
  private cleanups: Cleanup[] = [];
  private dependencies = new Set<Dependency>();

  constructor(private readonly callback: () => void) {}

  run = () => {
    this.cleanup();
    pushComputation(this);

    try {
      this.callback();
    } finally {
      popComputation();
    }
  };

  track(dependency: Dependency) {
    if (this.dependencies.has(dependency)) {
      return;
    }

    this.dependencies.add(dependency);
    this.cleanups.push(dependency.subscribe(this.run));
  }

  cleanup() {
    for (const cleanup of this.cleanups.splice(0)) {
      cleanup();
    }

    this.dependencies.clear();
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

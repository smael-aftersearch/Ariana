import type { Cleanup } from './types.js';

export type Dependency = {
  subscribe(subscriber: () => void): Cleanup;
};

export class ReactiveComputation {
  private cleanups: Cleanup[] = [];

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
    this.cleanups.push(dependency.subscribe(this.run));
  }

  cleanup() {
    for (const cleanup of this.cleanups.splice(0)) {
      cleanup();
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

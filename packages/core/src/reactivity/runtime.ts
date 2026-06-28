import type { Cleanup } from './types.js';

export type Dependency = {
  subscribe(subscriber: () => void): Cleanup;
};

export class ReactiveComputation {
  private dependencies: Dependency[] = [];
  private cleanups: Cleanup[] = [];
  private seenRuns: number[] = [];
  private runId = 0;

  constructor(
    private readonly callback: () => void,
    private readonly scheduler: () => void = () => this.run()
  ) {}

  run = () => {
    this.runId++;
    const previousComputation = currentComputation;
    currentComputation = this;

    try {
      this.callback();
    } finally {
      currentComputation = previousComputation;
      this.reconcileDependencies();
    }
  };

  track(dependency: Dependency) {
    const index = this.dependencies.indexOf(dependency);

    if (index !== -1) {
      this.seenRuns[index] = this.runId;
      return;
    }

    this.dependencies.push(dependency);
    this.cleanups.push(dependency.subscribe(this.scheduler));
    this.seenRuns.push(this.runId);
  }

  cleanup() {
    for (let index = 0; index < this.cleanups.length; index++) {
      this.cleanups[index]();
    }

    this.cleanups.length = 0;
    this.dependencies.length = 0;
    this.seenRuns.length = 0;
  }

  private reconcileDependencies() {
    if (this.dependencies.length === 1 && this.seenRuns[0] === this.runId) {
      return;
    }

    for (let index = this.dependencies.length - 1; index >= 0; index--) {
      if (this.seenRuns[index] === this.runId) {
        continue;
      }

      this.cleanups[index]();
      this.dependencies.splice(index, 1);
      this.cleanups.splice(index, 1);
      this.seenRuns.splice(index, 1);
    }
  }
}

let currentComputation: ReactiveComputation | undefined;

export function getActiveComputation(): ReactiveComputation | undefined {
  return currentComputation;
}

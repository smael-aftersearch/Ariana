import { ReactiveComputation } from './runtime.js';
import type { Cleanup } from './types.js';

export function effect(callback: () => void): Cleanup {
  const computation = new ReactiveComputation(callback);
  computation.run();

  return () => {
    computation.cleanup();
  };
}

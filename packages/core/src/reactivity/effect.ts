import { ReactiveComputation } from './runtime.js';
import type { Cleanup } from './types.js';

export type EffectCallback = () => void | Cleanup;

export function effect(callback: EffectCallback): Cleanup {
  let userCleanup: Cleanup | undefined;

  const computation = new ReactiveComputation(() => {
    userCleanup?.();
    userCleanup = undefined;
    const result = callback();
    if (typeof result === 'function') userCleanup = result;
  });

  computation.run();

  return () => {
    computation.cleanup();
    userCleanup?.();
    userCleanup = undefined;
  };
}

import { signal } from '@ariana/core';
import type { Signal } from '@ariana/core';

export type MutationStatus = 'idle' | 'pending' | 'success' | 'error';

export type MutationOptions<TInput, TResult, TRollback = unknown> = {
  mutationFn: (input: TInput) => Promise<TResult>;
  onMutate?: (input: TInput) => TRollback | Promise<TRollback>;
  onSuccess?: (result: TResult, input: TInput) => void | Promise<void>;
  onError?: (error: unknown, input: TInput, rollback: TRollback | undefined) => void | Promise<void>;
};

export type Mutation<TInput, TResult> = {
  readonly status: Signal<MutationStatus>;
  readonly data: Signal<TResult | undefined>;
  readonly error: Signal<unknown>;
  mutate(input: TInput): Promise<TResult>;
  reset(): void;
};

export function createMutation<TInput, TResult, TRollback = unknown>(options: MutationOptions<TInput, TResult, TRollback>): Mutation<TInput, TResult> {
  const status = signal<MutationStatus>('idle');
  const data = signal<TResult | undefined>(undefined);
  const error = signal<unknown>(undefined);

  async function mutate(input: TInput): Promise<TResult> {
    status.set('pending');
    error.set(undefined);
    let rollback: TRollback | undefined;

    try {
      rollback = await options.onMutate?.(input);
      const result = await options.mutationFn(input);
      data.set(result);
      status.set('success');
      await options.onSuccess?.(result, input);
      return result;
    } catch (caught) {
      error.set(caught);
      status.set('error');
      await options.onError?.(caught, input, rollback);
      throw caught;
    }
  }

  return {
    status,
    data,
    error,
    mutate,
    reset() {
      status.set('idle');
      data.set(undefined);
      error.set(undefined);
    }
  };
}

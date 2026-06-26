import { createMutation } from './mutation.js';
import type { Mutation, MutationOptions } from './mutation.js';

export type AfterMutation<TInput, TResult> = (result: TResult, input: TInput) => void | Promise<void>;

export function createMutationWithAfter<TInput, TResult, TRollback = unknown>(
  options: MutationOptions<TInput, TResult, TRollback>,
  after: AfterMutation<TInput, TResult>
): Mutation<TInput, TResult> {
  return createMutation({
    ...options,
    async onSuccess(result, input) {
      await options.onSuccess?.(result, input);
      await after(result, input);
    }
  });
}

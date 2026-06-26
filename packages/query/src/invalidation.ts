export type QueryInvalidationTarget = string | readonly string[];

export type QueryInvalidator = {
  invalidate(target: QueryInvalidationTarget): void;
  matches(key: string, target: QueryInvalidationTarget): boolean;
};

export function createQueryInvalidator(invalidateKey: (key: string) => void): QueryInvalidator {
  function matches(key: string, target: QueryInvalidationTarget): boolean {
    if (typeof target === 'string') return key === target || key.startsWith(`${target}:`);
    return target.some(item => matches(key, item));
  }

  return {
    invalidate(target) {
      if (typeof target === 'string') invalidateKey(target);
      else for (const item of target) invalidateKey(item);
    },
    matches
  };
}

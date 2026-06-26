# Query Invalidation API

Ariana query supports both exact invalidation and prefix invalidation.

## Exact invalidation

```ts
query.invalidate('users:1');
```

This marks only the exact cache entry as idle and stale.

## Prefix invalidation

```ts
query.invalidateMatching('users');
```

This invalidates:

- `users`
- `users:1`
- `users:profile`

It does not invalidate unrelated keys such as `orders:1`.

## Helper invalidator

```ts
const invalidator = createQueryInvalidator(key => query.invalidate(key));
```

The helper is useful for custom invalidation pipelines and mutation hooks.

## Mutation usage

```ts
const mutation = createMutationWithAfter(
  { mutationFn: saveUser },
  async () => query.invalidateMatching('users')
);
```

## Status

This API is pre-1.0 and should be validated through dashboard-style examples before being considered stable.

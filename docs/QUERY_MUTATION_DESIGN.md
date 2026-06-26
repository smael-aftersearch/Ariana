# Query Mutation Design

Ariana query needs mutation support before it can support realistic dashboard workflows.

## Goals

- explicit mutation API
- optimistic updates
- rollback on failure
- query invalidation
- pending/error/success state
- cancellation where possible

## Proposed API

```ts
const mutation = query.createMutation({
  mutationFn: saveUser,
  onMutate: input => optimisticUpdate(input),
  onError: (error, input, rollback) => rollback(),
  onSuccess: result => query.invalidate('users')
});
```

## Required behavior

- mutation state is signal-based
- concurrent mutations are explicit
- optimistic update rollback is predictable
- invalidation can target exact keys and prefixes

## Non-goals for first version

- offline persistence
- normalized entity cache
- implicit global retry policy

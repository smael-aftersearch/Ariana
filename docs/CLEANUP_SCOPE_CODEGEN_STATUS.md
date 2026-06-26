# Cleanup Scope Codegen Status

Ariana has a cleanup scope primitive and bootstrap-level cleanup integration.

## Current implementation

- `createCleanupScope()` exists in core.
- `bootstrapApplication()` creates a cleanup scope.
- compiled render functions receive a render context object.
- `renderCompiledComponent()` passes `{ injector, cleanupScope }` to compiled render functions.
- cleanup returned by compiled render is registered with the cleanup scope.

## Remaining codegen work

The compiler-generated render code still needs a full cleanup-scope-aware event listener path.

Target generated shape:

```ts
const cleanup = () => element.removeEventListener('click', listener);
cleanups.push(cleanup);
renderContext.cleanupScope?.add(cleanup);
```

## Why it matters

Generated event listeners and effects must be cleaned up when a root component is destroyed.

## Status for 0.5.0

Bootstrap integration is in place. Full generated listener registration is still pending and should be verified by browser-oriented tests.

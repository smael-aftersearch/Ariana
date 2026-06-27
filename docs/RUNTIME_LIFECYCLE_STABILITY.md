# Runtime Lifecycle Stability

This document tracks the runtime lifecycle work for version one.

## Current lifecycle contract

- `bootstrapApplication()` returns a `BootstrapRef`.
- `BootstrapRef.destroy()` is idempotent.
- `BootstrapRef.destroyed` reports whether the root has been destroyed.
- The root cleanup scope is cleaned during destroy.
- Compiled render cleanup is registered with the cleanup scope.
- Child cleanup scopes are cleaned when the parent scope is cleaned.

## Cleanup scope contract

A cleanup scope can:

- register cleanup callbacks
- create child cleanup scopes
- cleanup once
- report current size
- report cleaned state

Adding a cleanup after a scope has already been cleaned runs that cleanup immediately.

## Version one requirements

Before version one:

- browser interaction tests should verify listener cleanup
- compiled render tests should verify cleanup behavior
- child component cleanup should be tested in a generated app
- lifecycle docs should be linked from public docs

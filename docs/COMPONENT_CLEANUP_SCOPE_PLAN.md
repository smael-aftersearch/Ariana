# Component Cleanup Scope Plan

Ariana components need a cleanup scope that compiler-generated resources can use.

## Current state

`bootstrapApplication` exposes a `cleanupScope` and calls it during `destroy()`.

## Goal

Compiler-generated render functions should register resources with the active component cleanup scope.

Resources include:

- event listeners
- effects
- subscriptions
- child component refs
- island activations

## Proposed direction

Generated render functions should receive a context object:

```ts
render(ctx, host, { cleanupScope })
```

Then generated event binding code can call:

```ts
cleanupScope.add(() => element.removeEventListener('click', handler));
```

## First milestone

- define render context type
- pass cleanup scope from bootstrap to compiled render
- register event listener cleanup
- add browser fixture coverage

## Do not do yet

- no global cleanup registry
- no hidden Zone.js-like tracking
- no implicit async resource tracking

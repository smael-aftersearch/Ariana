# Runtime Lifecycle

This document defines the runtime lifecycle contract for the version one path.

## Lifecycle hooks

Ariana recognizes these optional component methods:

- `onInit()`
- `afterRender()`
- `onDestroy()`

## Mount order

For a root component:

1. create injector
2. create component instance
3. render template
4. call `onInit()` if present
5. call `afterRender()` if present

For child components, the parent template render creates child instances and calls child `onInit()` after the child template is rendered.

## Destroy contract

Destroying a root bootstrap reference must:

1. call root `onDestroy()` if present
2. cleanup all render effects
3. cleanup event listeners
4. cleanup conditional and repeated block child scopes
5. call child component `onDestroy()`
6. cleanup child render scopes
7. clear the host element

## Cleanup rules

- cleanup must be idempotent
- child cleanup must be owned by the parent render scope
- conditional block scopes must be cleaned when unmounted and when the parent is destroyed
- repeated block scopes must be cleaned before rerender and when the parent is destroyed
- compiled render functions must register returned cleanup with the bootstrap cleanup scope

## Version one requirement

Before version one, this lifecycle contract needs browser-backed tests in addition to current source and unit tests.

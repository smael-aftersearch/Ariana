# Public Lifecycle Contract

This document defines the lifecycle contract that must become stable before version one.

## Lifecycle methods

Ariana components may implement these lifecycle methods:

- `onInit()` runs after the component instance is created and rendered.
- `afterRender()` runs after the root component render pass completes.
- `onDestroy()` runs when the owning bootstrap or parent render scope is destroyed.

## Root component lifecycle

`bootstrapApplication()` returns a `BootstrapRef`.

The ref owns:

- component instance
- injector
- cleanup scope
- destroy function
- destroyed state

Calling `destroy()` should:

1. call root `onDestroy()` once
2. run registered cleanup callbacks once
3. clear the host element once
4. remain safe if called multiple times

## Child component lifecycle

When a parent template renders child components, the parent render scope owns child cleanup.

When the parent scope is cleaned:

1. child `onDestroy()` runs
2. child render cleanup runs
3. child event listeners and effects are removed

## Control-flow lifecycle

`@if` and `@for` blocks create child render scopes.

Those child scopes must be cleaned when:

- the control-flow condition changes
- the iterable changes
- the owning parent scope is destroyed

## Version one rule

Before version one, lifecycle behavior needs source-level tests, DOM-backed tests, and public examples.

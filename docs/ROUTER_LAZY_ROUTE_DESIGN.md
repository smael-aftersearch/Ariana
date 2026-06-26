# Router Lazy Route Design

Ariana router should support lazy routes without creating uncontrolled chunk behavior.

## Goals

- route-level lazy loading
- predictable chunk boundaries
- typed route params
- route-level providers
- lazy guard loading where useful
- clear diagnostics for invalid lazy route definitions

## Proposed API

```ts
const routes = [
  {
    path: '/admin',
    loadComponent: () => import('./admin.page').then(m => m.AdminPage)
  }
];
```

## Chunk policy

Lazy loading must be explicit. Ariana should not generate many route chunks by surprise.

## Required tests

- lazy route resolves component
- rejected dynamic import fails navigation safely
- guards run before lazy component activation when possible
- redirect loops are still prevented

## Non-goals

- copying Angular router complexity
- hidden preloading by default
- uncontrolled per-file chunk generation

# Ariana v3 Enterprise Preview

Ariana v3 starts the enterprise application layer on top of the v2 compiler/runtime work.

## What v3 adds in this preview

- `@ariana/router`
- typed route definitions
- parameter matching
- async/sync route guards
- redirect guards
- current route signal
- compiler AST package boundary in `@ariana/compiler`

## Router example

```ts
import { createRouter } from '@ariana/router';

const router = createRouter([
  { path: '/admin/users', component: UsersPage },
  { path: '/admin/users/:id', component: UserDetailsPage }
]);

await router.navigate('/admin/users/42');

const match = router.currentMatch();
console.log(match?.params.id);
```

## v3 scope

The goal of v3 is not SSR or resumability. The goal is enterprise app structure:

- typed router
- route guards
- route-level providers
- typed forms
- HTTP/query layer
- feature generator
- architecture rules

## Current status

```txt
v2 compiler/runtime:
  preview-complete enough for v3 work

v3 router:
  first typed-router preview available

v3 compiler:
  AST package boundary created

next:
  typed forms, route providers, browser benchmarks
```

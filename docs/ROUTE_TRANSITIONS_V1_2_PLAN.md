# Ariana 1.2 Route Transitions Plan

The dedicated admin `/animate` page now demonstrates scene transitions with `@if`, `animate.enter`, and `animate.leave`. The next step is to promote the same behavior into a router-level API.

## Proposed API

```ts
const routes = [
  {
    path: '/users',
    loadComponent: () => import('./pages/users.page.js'),
    transition: {
      enter: 'route-enter route-rise',
      leave: 'route-leave route-drop'
    }
  }
];
```

## Runtime rules

- Route transition classes are static strings.
- The router must not evaluate JavaScript strings.
- Leave cleanup should use the same computed CSS duration model as template animations.
- Route transition helpers should be emitted or loaded only when routes request transitions.
- No global observer.
- No polling.

## Implementation stages

### Stage 1: Router metadata contract

Add optional route metadata for `transition.enter` and `transition.leave`.

### Stage 2: Outlet transition coordinator

Create a small coordinator responsible for:

1. keeping the current route DOM mounted during leave;
2. applying leave classes;
3. waiting for `animationend` or `transitionend`;
4. using computed CSS duration fallback;
5. mounting the next route DOM and applying enter classes.

### Stage 3: Admin sample integration

Add route transition classes to the admin sample route definitions and verify lazy chunks still load independently.

### Stage 4: Release gates

Add checks for:

- route transition metadata;
- computed CSS duration cleanup;
- no fixed fallback duration;
- no runtime expression evaluation.

## Current manual sample

Use the admin animation page:

```txt
http://localhost:5173/animate
```

Manual checks:

- switch Flow/Data/Security scene tabs;
- toggle slow/normal mode;
- verify leaving scene stays visible until CSS animation completes;
- verify no stale DOM remains after cleanup.

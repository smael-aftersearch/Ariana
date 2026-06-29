# Ariana 1.2 Route Transitions Plan

The dedicated admin `/animate` page demonstrates scene transitions with `@if`, `animate.enter`, and `animate.leave`. Router-level transition metadata and shared helpers are now available in `@ariana/router`.

## API

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
- Leave cleanup uses the same computed CSS duration model as template animations.
- Route transition helpers are separate from the base router state path.
- No global observer.
- No polling.

## Implemented

### Stage 1: Router metadata contract

`RouteDefinition` now supports optional `transition.enter` and `transition.leave` metadata.

`RouteMatch` exposes the resolved transition, including inherited parent metadata.

`Router` exposes `currentTransition()`.

### Stage 2: Shared transition helpers

`packages/router/src/transitions.ts` includes:

- `normalizeRouteTransition`
- `hasRouteTransition`
- `applyRouteEnter`
- `runRouteLeave`
- `replaceWithRouteTransition`

The helper:

1. validates transition values as class names;
2. applies leave classes;
3. waits for `animationend` or `transitionend`;
4. reads computed CSS motion duration;
5. uses a bounded fallback;
6. replaces route DOM;
7. applies enter classes to the new route DOM.

### Stage 3: Lazy route metadata preservation

`resolveLazyRoute` preserves route transition metadata.

### Stage 4: Admin sample metadata

Admin routes now define shared transition metadata:

```ts
const adminRouteTransition = {
  enter: 'admin-route-enter admin-route-rise',
  leave: 'admin-route-leave admin-route-drop'
};
```

The admin sample keeps that metadata when creating its router instance.

### Stage 5: Release gates

`check-router-transition-support.mjs` checks:

- route transition metadata;
- lazy route metadata preservation;
- computed CSS duration cleanup;
- class-name validation;
- bounded fallback cleanup;
- admin sample route transition classes.

## Next step

The next implementation step is a first-class router outlet coordinator. Today, `replaceWithRouteTransition(host, next, transition)` exists as a low-level helper. The next step is to wire it into an outlet/component mounting API so applications do not need to call the helper manually.

## Current manual samples

Use the admin animation page:

```txt
http://localhost:5173/animate
```

Manual checks:

- switch Flow/Data/Security scene tabs;
- toggle slow/normal mode;
- verify leaving scene stays visible until CSS animation completes;
- verify no stale DOM remains after cleanup.

Use the admin shell:

```txt
http://localhost:5173/
```

Manual checks:

- login with demo credentials;
- navigate between Users, Orders, Reports, and Settings;
- verify lazy route metadata remains available;
- verify route transition class names exist in the admin animation stylesheet.

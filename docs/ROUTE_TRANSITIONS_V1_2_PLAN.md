# Ariana 1.2 Route Transitions Plan

The dedicated admin `/animate` page demonstrates scene transitions with `@if`, `animate.enter`, and `animate.leave`. Router-level transition metadata, shared helpers, and a first router outlet coordinator are now available in `@ariana/router`.

## API

```ts
const routes = [
  {
    path: '/users',
    component: UsersPage,
    transition: {
      enter: 'route-enter route-rise',
      leave: 'route-leave route-drop'
    }
  }
];
```

```ts
const router = createRouter(routes, '/');
const outlet = createRouterOutlet(router, '#route-host', {
  wrapperClass: 'route-view'
});

await outlet.render();
await outlet.navigate('/users');
```

## Runtime rules

- Route transition classes are static strings.
- The router must not evaluate JavaScript strings.
- Leave cleanup uses the same computed CSS duration model as template animations.
- Route transition helpers are separate from the base router state path.
- No global observer.
- No polling.
- If no transition exists, outlet replacement remains direct and lightweight.

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

### Stage 4: Router outlet coordinator

`packages/router/src/outlet.ts` includes `createRouterOutlet`.

The outlet coordinator:

1. reads `router.currentMatch()`;
2. mounts the matched route component into an isolated wrapper;
3. runs leave transition on the previous wrapper;
4. destroys the previous component after leave cleanup;
5. replaces the host with the next wrapper;
6. applies enter transition to the next wrapper;
7. avoids host cleanup when destroying a child component;
8. exposes `outlet.navigate(path)` for navigate-and-render flows.

### Stage 5: Admin sample metadata and manual page

Admin routes define shared transition metadata:

```ts
const adminRouteTransition = {
  enter: 'admin-route-enter admin-route-rise',
  leave: 'admin-route-leave admin-route-drop'
};
```

The admin sample keeps that metadata when creating its router instance.

A dedicated manual demo is available at:

```txt
http://localhost:5173/route-outlet
```

### Stage 6: Release gates

`check-router-transition-support.mjs` checks:

- route transition metadata;
- lazy route metadata preservation;
- computed CSS duration cleanup;
- class-name validation;
- bounded fallback cleanup;
- router outlet coordinator;
- outlet navigate helper;
- admin sample route transition classes;
- admin route outlet manual page.

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

Use the route outlet demo:

```txt
http://localhost:5173/route-outlet
```

Manual checks:

- click Mount outlet;
- switch Alpha, Beta, and Gamma;
- verify previous route waits for leave cleanup;
- verify next route enters with route transition classes;
- click Destroy and confirm outlet cleanup.

Use the admin shell:

```txt
http://localhost:5173/
```

Manual checks:

- login with demo credentials;
- navigate between Users, Orders, Reports, and Settings;
- verify lazy route metadata remains available;
- verify route transition class names exist in the admin animation stylesheet.

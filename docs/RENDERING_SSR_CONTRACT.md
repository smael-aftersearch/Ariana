# Rendering SSR Contract

Ariana rendering needs a clear contract before SSR can be considered production-ready.

## Current status

Rendering helpers exist for HTML shell rendering, static route generation, and island placeholders.

SSR is not production-ready yet.

## Goals

- deterministic HTML output
- explicit hydration boundaries
- clear island manifest format
- cleanup contract for activated islands
- route-to-file mapping for SSG

## Proposed SSR contract

```ts
const html = renderToString('<main>Hello</main>', {
  title: 'Ariana App'
});
```

## Proposed SSG contract

```ts
const pages = generateStaticRoutePages(routes, async route => renderRoute(route));
```

## Required tests

- render shell contains body
- title escaping
- route path to file path
- island placeholder serialization
- island activation cleanup

## Non-goals before integration tests

- production SSR claim
- streaming SSR claim
- partial hydration claim

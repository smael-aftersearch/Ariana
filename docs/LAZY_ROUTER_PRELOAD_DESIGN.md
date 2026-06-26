# Lazy Router Guards and Preload Design

Ariana lazy routing must stay explicit and predictable.

## Goals

- resolve lazy route components before activation
- keep guard order predictable
- support optional preloading later
- avoid uncontrolled chunk creation

## Proposed phases

1. Resolve lazy route definitions into normal route definitions.
2. Match route using existing matcher.
3. Run guards in parent-to-child order.
4. Activate the matched component.

## Preload policy

Preloading must be opt-in.

Possible future API:

```ts
preloadRoutes(router, { strategy: 'visible-links' })
```

## Do not do yet

- no hidden eager loading
- no automatic preloading by default
- no framework-generated chunk explosion
- no router complexity copied blindly from Angular

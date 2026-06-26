# Ariana Public API Surface

This document defines the intended public API surface for the current Ariana release line.

## Scope

The public npm scope is `@ariana-framework`.

## Packages

- `@ariana-framework/core`
- `@ariana-framework/compiler`
- `@ariana-framework/router`
- `@ariana-framework/forms`
- `@ariana-framework/query`
- `@ariana-framework/rendering`
- `@ariana-framework/vite-plugin`

## Core

Public runtime APIs:

- `signal(initialValue)`
- `computed(factory)`
- `effect(callback)`
- `listSignal(items, keySelector)`
- `Component(metadata)`
- `Route(path)`
- `bootstrap(component, options)`
- `Injector`
- `inject(token)`
- `provide(token, value)`
- `runInInjectionContext(injector, callback)`

Stability rule:

- signal, computed, and effect are the first APIs that should become stable.
- component metadata can still evolve before 1.0.
- template runtime helpers are internal unless documented here.

## Compiler

Public compiler APIs:

- `parseTemplateToAst(template)`
- template diagnostics types
- AST node types

Stability rule:

- diagnostics codes should become stable before 0.5.0.
- generated code shape is not public API yet.

## Router

Public router APIs:

- `createRouter(routes, initialPath, options)`
- `matchRoutes(routes, path)`
- route definition types
- route guard types

Stability rule:

- route matching and navigation should be stable before nested layouts and lazy loading are added.

## Forms

Public forms APIs:

- `formControl(initialValue, validatorsOrOptions)`
- `formGroup(controls)`
- `required(message)`
- `minLength(length)`
- `asyncUnique(isUnique, message)`

Stability rule:

- FormControl and FormGroup must remain small until FormArray and nested forms are designed.

## Query

Public query APIs:

- `createQueryClient(now)`
- `QueryClient`
- `QueryState`

Stability rule:

- query caching must remain simple until mutation and invalidation APIs are tested in real examples.

## Rendering

Public rendering APIs:

- `renderToString(body, options)`
- `generateStaticRoutePages(routes, renderer)`
- `defineIsland(id, componentName, props)`
- `renderIslandPlaceholder(island)`
- `islandScript(islands)`
- `parseIslandManifest(root)`
- `activateIslands(registry, root)`
- `cleanupIslands(result)`
- `routePathToFilePath(routePath)`

Stability rule:

- SSR/SSG/islands are early APIs and must not be marketed as production-ready yet.

## Vite Plugin

Public Vite plugin APIs:

- `ariana(options)`
- default export `ariana`
- `ArianaVitePluginOptions`

Stability rule:

- strict template diagnostics must remain enabled by default once compiler output is stable.

## Breaking change policy before 1.0

Before 1.0, Ariana may introduce breaking changes, but every breaking change must be documented in the changelog and tied to a migration note.

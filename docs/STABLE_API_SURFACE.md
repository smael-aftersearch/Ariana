# Stable API Surface

This file is the first stable API registry for the version one path.

## Core

Required public API candidates:

- `signal`
- `computed`
- `effect`
- `createCleanupScope`
- `Component`
- `bootstrap`
- `bootstrapApplication`
- `Injector`
- `inject`
- `provideValue`
- `provideFactory`

## Compiler

Required public API candidates:

- template parsing diagnostics
- template compile result
- template typecheck helper
- error codes

## Router

Required public API candidates:

- `createRouter`
- `createLazyRouter`
- route definition type
- lazy route definition type
- route match result type

## Forms

Required public API candidates:

- `formControl`
- `formArray`
- sync validators
- async validators
- form status types

## Query

Required public API candidates:

- `createQueryClient`
- `createMutation`
- `createMutationWithAfter`
- `createQueryInvalidator`
- invalidation target types

## Rendering

Required public API candidates:

- `renderToString`
- SSR contract types

## Vite plugin

Required public API candidates:

- `ariana`
- `ArianaVitePluginOptions`

## CLI

Required public API candidate:

- `create-ariana` command

## Lock rule

Before version one, every API listed here needs:

- documentation
- at least one unit or integration test
- compatibility snapshot coverage
- migration notes if renamed or removed

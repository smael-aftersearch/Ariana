# Template Typecheck V1

This document defines the first version-one target for Ariana template type checking.

## Scope

The typechecker validates root identifiers in template expressions against a component context.

Supported expression locations:

- interpolation expressions
- property bindings
- class bindings
- event bindings
- `@if` expressions
- `@for` iterable expressions
- `@for` track expressions

## Scoped identifiers

The typechecker supports these template-local identifiers:

- `item` or the declared item name inside `@for`
- `$index` inside `@for`
- `$event` inside event bindings

## Safe globals

The typechecker allows common expression globals such as:

- `Math`
- `Number`
- `String`
- `Boolean`
- `Array`
- `Date`
- `JSON`

## Component context inference

The compiler owns component context inference for the version-one path.

The public helper is:

```ts
inferComponentContextMembers(source)
```

It currently infers:

- class fields
- typed class fields
- methods
- getters and setters

The Vite plugin must use this compiler-owned helper instead of keeping a duplicate inference implementation.

## Current diagnostic

Unknown component members are reported as:

```txt
ARI_TYPE_UNKNOWN_MEMBER
```

## Current limitation

This is not full TypeScript semantic analysis yet.

The version-one path still needs:

- type-aware property access validation
- method argument type validation
- template source mapping for precise editor diagnostics

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

## Type-aware groundwork

`typeCheckTemplate` can accept explicit symbol metadata through `symbols`.

Supported groundwork checks:

- unknown object property: `ARI_TYPE_UNKNOWN_PROPERTY`
- calling a non-method member: `ARI_TYPE_CALL_NON_METHOD`
- method argument count: `ARI_TYPE_METHOD_ARGUMENT_COUNT`

This is not full TypeScript semantic analysis. It is an explicit symbol metadata contract that can later be fed by real TypeScript analysis.

## Diagnostics formatting

Compiler diagnostics can be formatted with:

```ts
formatTemplateDiagnostic(source, diagnostic)
formatTemplateDiagnostics(source, diagnostics)
```

The Vite plugin uses the compiler formatter for template typecheck errors.

## Current diagnostic

Unknown component members are reported as:

```txt
ARI_TYPE_UNKNOWN_MEMBER
```

## Current limitation

This is not full TypeScript semantic analysis yet.

The version-one path still needs:

- TypeScript-backed symbol extraction
- method argument type validation
- editor fixture coverage for diagnostic output

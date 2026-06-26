# Compiler Typecheck API

The compiler package exposes a typecheck subpath for template type checking groundwork.

## Import

```ts
import { typeCheckTemplate } from '@ariana-framework/compiler/typecheck';
```

## Example

```ts
const result = typeCheckTemplate('<p>{{ title }}</p>', {
  members: ['title']
});
```

## Diagnostic

The first typecheck diagnostic is:

```txt
ARI_TYPE_UNKNOWN_MEMBER
```

It is emitted when a template expression references a member that is not declared in the provided component context.

## Current limitation

This is groundwork, not full TypeScript semantic analysis. It does not yet infer component members from TypeScript source automatically.

## Vite plugin plan

The Vite plugin has a `typeCheckTemplates` option. The next step is to connect that option to a real component context and call this API during transform.

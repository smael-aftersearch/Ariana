# Vite Typecheck Context Plan

The Vite plugin currently has a `typeCheckTemplates` option as groundwork.

## Goal

Connect Vite template checking to the compiler `typeCheckTemplate` helper with component class context.

## Required information

The plugin needs to discover or synthesize:

- component class name
- public fields
- public methods
- template source
- template source path

## First safe milestone

The first implementation should support an explicit context comment or plugin-provided context, not full TypeScript AST reflection.

Example future direction:

```ts
@Component({ templateUrl: './page.html' })
export class Page {
  readonly title = signal('Ariana');
  save() {}
}
```

The plugin should eventually infer `title` and `save` and pass them to `typeCheckTemplate`.

## Non-goals for the first implementation

- full TypeScript semantic analysis
- generics inference
- private member enforcement
- complex expression typing

## Guardrail

If `strictTemplates` and `typeCheckTemplates` are enabled, typecheck errors should fail the Vite transform.

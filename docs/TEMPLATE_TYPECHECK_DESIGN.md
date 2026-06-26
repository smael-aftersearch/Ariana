# Template Type Checking Design

Ariana templates should eventually be type checked against the component class.

## Goals

- validate component property access
- validate method calls
- validate event handler names
- validate loop variable scopes
- validate block-local variables
- provide source spans for diagnostics

## Initial scope

The first template type checking milestone should cover:

- interpolation expressions
- property bindings
- event handler existence
- `@for` item variable scope
- `@if` expression existence

## Non-goals for the first milestone

- full TypeScript expression evaluation
- generic template inference
- directive-like microsyntax
- pipes
- two-way binding

## Design direction

The compiler should create a synthetic TypeScript checking context for each component template.

Example:

```html
<p>{{ title }}</p>
<button (click)="save()">Save</button>
```

Should validate that the component has:

```ts
title: string;
save(): void;
```

## Diagnostics

Type checking diagnostics should use stable `ARI_TYPE_*` codes once introduced.

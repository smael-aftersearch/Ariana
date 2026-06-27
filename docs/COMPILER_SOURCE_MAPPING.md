# Compiler Source Mapping

Compiler diagnostics now include source location groundwork for the version one path.

## Diagnostic location

A diagnostic can include:

```ts
location?: {
  line: number;
  column: number;
}
```

Line and column are one-based.

## Public helpers

The compiler exposes:

```ts
getSourceLocation(source, index)
createTemplateDiagnostic(source, level, code, message, index)
```

## Parser behavior

Parser diagnostics should be created with `createTemplateDiagnostic` so source index, line, and column stay consistent.

Nested template diagnostics from `@if` and `@for` bodies should be shifted back to the original template source before they are returned.

## Version one requirement

Before version one, editor integrations should use this location data instead of recomputing diagnostic positions independently.

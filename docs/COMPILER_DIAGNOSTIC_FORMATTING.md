# Compiler Diagnostic Formatting

Ariana compiler diagnostics have editor-facing formatting helpers for the version one path.

## APIs

```ts
formatTemplateDiagnostic(source, diagnostic, options)
formatTemplateDiagnostics(source, diagnostics, options)
getSourceLine(source, line)
```

## Output shape

A formatted diagnostic includes:

```txt
file.html:2:3 ERROR ARI_TYPE_UNKNOWN_MEMBER: Unknown template member: title
```

With source line enabled, it also includes the source excerpt and pointer.

## Vite integration

The Vite plugin should format template parse and typecheck errors through the compiler formatter.

This keeps CLI, Vite, and future editor integrations aligned around one diagnostic presentation model.

## Version one requirement

Before version one, formatted diagnostics should be used by:

- Vite transform errors
- CLI checks
- editor-oriented diagnostics fixtures

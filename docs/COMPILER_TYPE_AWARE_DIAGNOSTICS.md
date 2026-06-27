# Compiler Type Aware Diagnostics

This document extends the compiler diagnostics registry for the version one type aware validation track.

## Codes

- `ARI_TYPE_UNKNOWN_PROPERTY`: template expression references a property not declared on a typed object symbol.
- `ARI_TYPE_CALL_NON_METHOD`: template expression calls a known member that is not declared as a method.
- `ARI_TYPE_METHOD_ARGUMENT_COUNT`: template method call does not satisfy the declared argument count.

## Formatter APIs

Compiler diagnostics can be formatted with:

- `formatTemplateDiagnostic`
- `formatTemplateDiagnostics`
- `getSourceLine`

## Version one status

These checks are groundwork. They validate only explicit symbol metadata supplied to `typeCheckTemplate`.

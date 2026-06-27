# Version One Patch 03

Patch 03 starts compiler diagnostics and template typecheck stabilization.

## Completed in this patch start

- Compiler diagnostics registry added.
- Compiler diagnostics registry check script added.
- Compiler diagnostics check command added to package scripts.
- Compiler diagnostics check added to CI.
- Version one plan moved patch 03 to started.

## Diagnostic codes covered

- `ARI_UNCLOSED_INTERPOLATION`
- `ARI_UNCLOSED_ELEMENT`
- `ARI_INVALID_ELEMENT`
- `ARI_MISSING_CLOSE_TAG`
- `ARI_INVALID_IF`
- `ARI_INVALID_FOR`
- `ARI_TYPE_UNKNOWN_MEMBER`

## Remaining compiler work

- Add explicit diagnostic tests for every code.
- Export stable diagnostic code constants.
- Improve template typecheck context inference.
- Connect Vite plugin typecheck to compiler registry.
- Add typed examples for `@if`, `@for`, event bindings, property bindings, and class bindings.

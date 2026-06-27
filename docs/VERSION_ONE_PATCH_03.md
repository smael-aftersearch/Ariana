# Version One Patch 03

Patch 03 hardens compiler diagnostics and template typecheck for the version one path.

## Completed

- Compiler diagnostics registry added.
- Compiler diagnostics registry check script added.
- Compiler diagnostics check command added to package scripts.
- Compiler diagnostics check added to CI.
- Template typecheck now recognizes `$index` inside `@for` blocks.
- Template typecheck now recognizes `$event` inside event bindings.
- Template typecheck allows safe expression globals such as `Math`, `Number`, `String`, `Boolean`, `Array`, `Date`, and `JSON`.
- Compiler typecheck tests were expanded for scoped identifiers and safe globals.
- Compiler diagnostics registry now includes all parser and typecheck diagnostics.
- Compiler diagnostics registry now includes examples for every diagnostic.
- Compiler diagnostics registry check now validates all current diagnostics.
- Template typecheck v1 contract document added.
- Template typecheck docs check added to CI.
- Version one plan moved patch 03 to started.

## Diagnostic codes covered

- `ARI_UNCLOSED_INTERPOLATION`
- `ARI_UNCLOSED_ELEMENT`
- `ARI_INVALID_ELEMENT`
- `ARI_MISSING_CLOSE_TAG`
- `ARI_INVALID_IF`
- `ARI_INVALID_FOR`
- `ARI_UNKNOWN_BINDING`
- `ARI_INVALID_FOR_EXPRESSION`
- `ARI_TYPE_UNKNOWN_MEMBER`

## Remaining compiler work

- infer typecheck context from component class source in the compiler package
- add source mapping for diagnostics
- add diagnostics for empty interpolation expressions
- add diagnostics for unsupported binding expression shapes
- wire compiler typecheck into the Vite plugin without duplicate logic
- add migration notes if any diagnostic code changes before version one

## Next focus

Continue Patch 03 by adding compiler-owned component context inference and replacing Vite-local inference with compiler-owned helpers.

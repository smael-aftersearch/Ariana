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
- Compiler now owns component context inference with `inferComponentContextMembers`.
- Compiler now exposes `mergeTypeCheckMembers` for stable member merging.
- Vite plugin now uses compiler-owned `inferComponentContextMembers`, `mergeTypeCheckMembers`, and `typeCheckTemplate`.
- Vite-local duplicate inference logic was removed.
- TypeScript path aliases were added for compiler typecheck subpath.
- Stable API registry now includes compiler typecheck helpers.
- Stable API docs check now requires compiler typecheck helpers.
- Vite transform tests now validate compiler-owned inference behavior.
- Compiler diagnostics now include one-based source locations.
- Compiler exports `getSourceLocation` and `createTemplateDiagnostic`.
- Empty interpolation diagnostic added.
- Empty binding expression diagnostic added.
- Unsupported inline binding expression diagnostic added.
- Tag parsing now ignores `>` tokens inside quoted attributes.
- Compiler diagnostics tests now cover location and new expression diagnostics.
- Error code docs now include all current compiler diagnostics.
- Compiler source mapping document added.
- Compiler typecheck now accepts explicit typed symbol metadata.
- Type-aware unknown property diagnostic added.
- Type-aware non-method call diagnostic added.
- Type-aware method argument count diagnostic added.
- Compiler diagnostic formatter subpath added.
- `formatTemplateDiagnostic`, `formatTemplateDiagnostics`, and `getSourceLine` added.
- Vite template errors now use compiler-owned formatted diagnostics.
- Stable API registry now includes compiler formatter APIs.
- Diagnostic formatter tests added.
- Template typecheck docs now document type-aware groundwork and formatter APIs.
- Version one plan moved patch 03 to started.

## Diagnostic codes covered

- `ARI_UNCLOSED_INTERPOLATION`
- `ARI_EMPTY_INTERPOLATION`
- `ARI_UNCLOSED_ELEMENT`
- `ARI_INVALID_ELEMENT`
- `ARI_MISSING_CLOSE_TAG`
- `ARI_INVALID_IF`
- `ARI_INVALID_FOR`
- `ARI_UNKNOWN_BINDING`
- `ARI_INVALID_FOR_EXPRESSION`
- `ARI_EMPTY_BINDING_EXPRESSION`
- `ARI_UNSUPPORTED_BINDING_EXPRESSION`
- `ARI_TYPE_UNKNOWN_MEMBER`
- `ARI_TYPE_UNKNOWN_PROPERTY`
- `ARI_TYPE_CALL_NON_METHOD`
- `ARI_TYPE_METHOD_ARGUMENT_COUNT`

## Remaining compiler work

- add TypeScript-backed symbol extraction
- add method argument type validation
- add migration notes if any diagnostic code changes before version one
- add browser/editor fixture coverage for template diagnostics
- add CLI command that prints formatted diagnostics

## Next focus

Continue Patch 03 with TypeScript-backed symbol extraction groundwork, CLI diagnostic command, and editor fixture coverage.

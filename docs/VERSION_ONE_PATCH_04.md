# Version One Patch 04

Patch 04 starts Vite plugin productionization for the version one path.

## Completed in the opening step

- Vite plugin now uses compiler `createTypeCheckContextFromSource`.
- Vite plugin now supports `templateTypeCheckSymbols`.
- Vite plugin now supports `strictWarnings`.
- Vite plugin keeps using compiler formatted diagnostics.
- Vite transform tests now cover formatted unknown member errors.
- Vite transform tests now cover source-based typed property diagnostics.
- Vite transform tests now cover warning escalation.
- Vite plugin v1 contract document added.
- Diagnostic migration notes for version one added.
- Vite plugin v1 docs check script added.
- Version one plan moved Patch 04 to started.

## Remaining Vite plugin work

- robust multi-component file transform coverage
- source map strategy documentation
- browser fixture coverage
- styleUrl edge cases
- package install smoke coverage for Vite plugin options
- migration notes if any option name changes before version one

## Next focus

Continue Patch 04 with multi-component source tests, transform edge cases, and source map strategy docs.

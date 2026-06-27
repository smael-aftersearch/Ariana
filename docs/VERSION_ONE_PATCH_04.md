# Version One Patch 04

Patch 04 productionizes the Vite plugin for the version one path.

## Completed

- Vite plugin now uses compiler `createTypeCheckContextFromSource`.
- Vite plugin now supports `templateTypeCheckSymbols`.
- Vite plugin now supports `strictWarnings`.
- Vite plugin keeps using compiler formatted diagnostics.
- Vite plugin now uses a balanced component metadata scanner instead of a simple metadata regex.
- Vite plugin now tracks transformed component count internally.
- Vite plugin now reports Ariana resource errors for missing external resources.
- Vite transform tests now cover formatted unknown member errors.
- Vite transform tests now cover source-based typed property diagnostics.
- Vite transform tests now cover warning escalation.
- Vite transform tests now cover multiple components in a single source file.
- Vite transform tests now cover nested metadata object literals.
- Vite transform tests now cover missing template resource errors.
- Vite plugin v1 contract document added.
- Vite transform contract addendum added.
- Vite source map strategy document added.
- Vite edge case tracker added.
- Diagnostic migration notes for version one added.
- Vite plugin v1 docs check script added.
- Version one plan moved Patch 04 to started.

## Remaining Vite plugin work

- browser fixture coverage
- Windows path fixture
- style-only component fixture
- generated render mode edge cases
- package install smoke coverage for Vite plugin options
- migration notes if any option name changes before version one

## Next focus

Continue Patch 04 with browser fixture coverage, style-only components, generated render mode edge cases, and install smoke coverage for Vite plugin options.

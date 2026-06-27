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
- Vite plugin options smoke script added.
- Version one release checklist added.
- Version one release readiness document added.
- Version one release notes draft added.
- Version one candidate pack helper added.
- Version one plan moved Patch 04 to started.

## Remaining Vite plugin work

- browser fixture coverage
- Windows path fixture
- style-only component fixture
- generated render mode edge cases
- migration notes if any option name changes before version one

## Release readiness gates

- run `npm run build`
- run `npm test`
- run all docs checks
- run template diagnostics fixture check
- run Vite plugin options smoke
- run `node scripts/pack-v1-candidate.mjs`
- run publish dry-run only after all gates pass

## Next focus

Close Patch 04 by adding style-only and generated-render fixtures, then run the release gate list before publishing version one.

# Batch 7 Progress

Completed in this batch:

- Continued the central production tracker.
- Added compiler `./typecheck` public export subpath.
- Added generated app smoke test script.
- Added generated app smoke command.
- Added generated app smoke step to CI.
- Added QueryClient `invalidateMatching` direct prefix invalidation API.
- Added `invalidateMatching` unit tests.
- Added query invalidation helper tests.
- Added lazy router preload design.
- Added Vite typecheck context plan.
- Added component cleanup scope plan.
- Added supplemental next documentation index.
- Updated production tracker through prod-144.

## Current state

Ariana is still pre-0.5.0. The next release should wait until CI is clean with the generated app smoke test and Vite fixture checks.

## Next batch

- Fix generated app smoke failures from CI.
- Fix Vite fixture transform failures from CI.
- Wire real typecheck context into the Vite plugin.
- Pass cleanup scope into compiler-generated event listeners.
- Promote create-ariana into the root build after Node typings are handled.

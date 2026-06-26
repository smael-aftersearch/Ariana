# Batch 6 Progress

This batch answered the tracking gap and continued the next proposed production tasks.

## Completed

- Added central `docs/PRODUCTION_TRACKER.md`.
- Added release policy for when to publish new versions.
- Added compiler `./typecheck` export subpath.
- Added query helper public exports.
- Added query invalidation tests.
- Added `createLazyRouter` API and tests.
- Added generated app smoke test.
- Added generated app smoke command.
- Added generated app smoke check to CI.
- Added lazy router preload design.
- Added Vite typecheck context plan.
- Added component cleanup scope plan.
- Added supplemental documentation index.

## Updated status for prod-124..prod-133

| ID | Result |
| --- | --- |
| prod-124 | In progress through CI hardening and smoke checks. |
| prod-125 | Done through compiler `./typecheck` export subpath. |
| prod-126 | Partial; CLI skeleton smoke is validated, full package build is deferred. |
| prod-127 | Done through generated app smoke script and CI step. |
| prod-128 | Done through query invalidation helper tests. |
| prod-129 | Done through mutation after-success/invalidation helper tests. |
| prod-130 | Done as design doc for lazy route guards/preload. |
| prod-131 | Done as Vite typecheck context plan. |
| prod-132 | Done as component cleanup scope plan. |
| prod-133 | Done through tracker and supplemental docs index. |

## Next batch

- Fix CI failures exposed by generated app smoke.
- Promote `create-ariana` into the root build only after TypeScript config stabilizes.
- Wire real compiler typecheck context into Vite plugin.
- Pass cleanup scope into compiler-generated event listeners.
- Add direct query prefix invalidation to QueryClient when safe.

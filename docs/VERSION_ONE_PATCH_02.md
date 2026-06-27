# Version One Patch 02

Patch 02 hardens runtime lifecycle behavior for the version one path.

## Completed

- Cleanup scope is idempotent.
- Cleanup scope exposes cleaned state.
- Cleanup scope supports child scopes.
- Parent cleanup cleans child scopes.
- Adding cleanup after cleanup runs immediately.
- Bootstrap destroy is idempotent.
- BootstrapRef exposes destroyed state.
- `renderComponent` returns a cleanup function.
- Parent render scope registers child component cleanup.
- Child component `onDestroy` is called when parent cleanup runs.
- Conditional block scopes are registered with parent cleanup.
- Repeated block scopes are cleaned when parent cleanup runs.
- Runtime lifecycle contract document added.
- Runtime lifecycle documentation check added to CI.
- Runtime lifecycle stability document added.
- Cleanup scope tree tests added.
- Bootstrap lifecycle source test added.
- Runtime lifecycle source tests added.

## Remaining runtime work

- browser interaction test for event listener cleanup
- generated app test for child component cleanup
- compiled render cleanup runtime test with a DOM runner
- nested child component destroy ordering test with browser runner

## Next patch

Patch 03 should focus on compiler diagnostics and template typecheck completion.

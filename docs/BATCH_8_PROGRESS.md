# Batch 8 Progress

Completed in this batch:

- Reduced false positives in tarball inspection by skipping source map content scans.
- Adjusted Vite component resource transform output to emit a valid `Component({...})` call instead of decorator syntax after transform.
- Added Vite resource transform unit test.
- Added generated app smoke documentation.
- Added query invalidation API documentation.
- Added compiler typecheck API documentation.
- Updated production tracker through prod-154.

## Completed prod range

| ID | Result |
| --- | --- |
| prod-145 | Generated app smoke CI hardening started. |
| prod-146 | Vite fixture component transform adjusted. |
| prod-147 | Compiler typecheck API documented. |
| prod-148 | Cleanup scope event listener work remains design-level. |
| prod-149 | create-ariana build plan remains deferred. |
| prod-150 | Query invalidation API documented. |
| prod-151 | Compiler typecheck API documented. |
| prod-152 | Vite component transform test added. |
| prod-153 | Generated app smoke doc added. |
| prod-154 | Tracker updated through current batch. |

## Next batch

- Fix CI failures reported by GitHub Actions.
- Wire real Vite typecheck context to compiler typecheck helper.
- Pass cleanup scope into compiler-generated event listeners.
- Add generated app coverage for router/forms/query packages.
- Draft 0.5.0 release checklist.

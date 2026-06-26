# Batch 9 Progress

Completed in this batch:

- Hardened Vite resource transform to support both decorator syntax and direct `Component({...})` call syntax.
- Preserved decorator prefix during resource transform.
- Added `templateTypeCheckMembers` option as an explicit typecheck context bridge.
- Added Vite transform tests for direct call syntax, decorator syntax, and unknown template member failures.
- Expanded generated app smoke test to import and use core, router, forms, query, and vite-plugin together.
- Added 0.5.0 checklist document.
- Updated production tracker through prod-166.

## Completed prod range

| ID | Result |
| --- | --- |
| prod-155 | CI hardening continued through Vite/generated app fixes. |
| prod-156 | Vite typecheck now has an explicit member context option. |
| prod-157 | Cleanup scope event listener work remains pending. |
| prod-158 | create-ariana build promotion remains pending Node typings decision. |
| prod-159 | Generated app now covers router, forms, and query. |
| prod-160 | 0.5.0 checklist added. |
| prod-161 | Vite direct Component call transform hardened. |
| prod-162 | Vite decorator transform hardened. |
| prod-163 | Vite typecheck failure test added. |
| prod-164 | Generated app smoke coverage expanded. |
| prod-165 | Release checklist added. |
| prod-166 | Tracker updated through the batch. |

## Next batch

- Fix CI failures reported by GitHub Actions.
- Pass cleanup scope into generated event listeners.
- Promote create-ariana build after Node typings are handled.
- Infer Vite typecheck members from component class source.
- Add browser interaction coverage for generated app.
- Draft 0.5.0 changelog.

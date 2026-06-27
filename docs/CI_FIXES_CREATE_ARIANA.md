# CI Fixes Create Ariana

This note records the fixes applied after CI failed with a missing create-ariana TypeScript config.

## Fixed

- Added `packages/create-ariana/tsconfig.json`.
- Kept minimal Node shims for `process`, `node:fs`, and `node:path`.
- Updated create-ariana starter to include the 0.5 package set.
- Updated create-ariana smoke validation to check core, router, forms, query, and Vite plugin.
- Updated create-ariana README to match the 0.5 starter.
- Fixed framework comparison benchmark local package import path.
- Added package scripts for release candidate, benchmark smoke, framework benchmark, and generated app coverage.
- Promoted generated app coverage and benchmark smoke into main CI.

## Next expected CI gate

Run:

```bash
npm run build
```

If another TypeScript error appears, fix that next before adding new framework features.

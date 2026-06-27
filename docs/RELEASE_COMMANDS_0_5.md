# Ariana 0.5.0 Release Commands

Use these commands only after CI is green.

## Local verification

```bash
npm install --no-audit --no-fund
npm run build
npm test
npm run verify:release
npm run inspect:tarballs
npm run smoke:install
npm run smoke:create-ariana
npm run smoke:generated-app
npm run smoke:generated-app:coverage
npm run bench:smoke
npm run pack:0.5:candidate
```

## Framework comparison

```bash
npm run bench:framework
```

## Publish rule

Do not publish until:

- main CI is green
- Vite fixture workflow is green
- Benchmark Smoke workflow is green
- Framework Bench workflow is green
- release notes are reviewed
- benchmark comparison output is reviewed

## Current limitation

The main `pack-npm.mjs` script still stages the currently published release line by default. The `pack-0-5-candidate.mjs` helper temporarily switches the staging and inspection version to 0.5.0 for candidate verification.

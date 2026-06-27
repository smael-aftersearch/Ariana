# Ariana 1.0 Release Checklist

Ariana 1.0 should be released only after these gates are green.

## Required local gates

```bash
npm install --no-audit --no-fund
npm run build
npm test
npm run check:stable-api-docs
npm run check:runtime-lifecycle-docs
npm run check:compiler-diagnostics
npm run check:template-typecheck-docs
npm run check:template-diagnostics-fixture
node scripts/check-vite-plugin-v1-docs.mjs
node scripts/vite-plugin-options-smoke.mjs
node scripts/bench-smoke.mjs
node scripts/pack-v1-candidate.mjs
```

## Required release gates

- Vite plugin options smoke passes.
- Template diagnostics fixture passes.
- 1.0 candidate tarballs are generated and inspected.
- Framework benchmark output is captured before any public performance claim.
- Release notes are reviewed.
- Migration notes are reviewed.
- Known limitations are documented.

## Publish command

Do not publish until all required gates are green.

```bash
npm run publish:npm:dry
```

Official publish should happen only from an authenticated release workflow or after explicit approval.

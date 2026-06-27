# Ariana 1.0 Final Gate List

Run the complete gate set before version one is released.

## One command

```bash
npm run release:gates:v1
```

## Manual sequence

```bash
npm install --no-audit --no-fund
npm run build
npm test
npm run check:stable-api-docs
npm run check:runtime-lifecycle-docs
npm run check:compiler-diagnostics
npm run check:template-typecheck-docs
npm run check:template-diagnostics-fixture
npm run check:vite-plugin-v1-docs
npm run smoke:runtime-lifecycle
npm run smoke:vite-plugin-options
npm run bench:smoke
npm run pack:v1:candidate
```

## Final rule

Only move version one forward after this gate list passes.

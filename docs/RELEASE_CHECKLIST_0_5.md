# Ariana 0.5.0 Checklist

Ariana 0.5.0 is the next meaningful milestone after the first public npm release line.

## CI gates

- npm install
- npm run build
- npm test
- npm run verify:release
- npm run inspect:tarballs
- npm run smoke:install
- npm run smoke:create-ariana
- npm run smoke:generated-app
- Vite fixture workflow passes

## Package gates

- all public packages install from generated tarballs
- no workspace dependency leaks into tarballs
- no stale internal runtime import leaks into published JavaScript or type files
- compiler typecheck subpath is packaged
- generated app imports core, router, forms, query, and vite-plugin

## Framework gates

- core has a destroyable bootstrap reference
- forms include FormArray and async validation aggregation
- query includes mutation and prefix invalidation groundwork
- router includes lazy route resolution groundwork
- Vite plugin transforms component resources safely
- compiler typecheck groundwork is documented

## Documentation gates

- production tracker is current
- API additions are documented
- generated app smoke test is documented
- query invalidation API is documented
- compiler typecheck API is documented

## Not allowed for 0.5.0

- production-ready marketing claim
- SSR or SSG production claim
- npm scope rename
- large new public API without tests

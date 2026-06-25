# Changelog

## 0.4.0-alpha.0 - 2026-06-25

### Added

- v4 rendering preview through `@ariana/rendering`.
- SSR shell rendering helper.
- Static page generation helper.
- Island definition, placeholder, and manifest helpers.
- NPM release scripts for packing and guarded publishing.
- Release verification script.
- GitHub Actions workflows for CI and npm publishing.

### Completed preview scope

- v2 compiler/runtime preview is complete enough for v3 work.
- v3 enterprise preview is complete enough for v4 work.
- v4 rendering preview is started.

### Packages

- `@ariana/core`
- `@ariana/compiler`
- `@ariana/router`
- `@ariana/forms`
- `@ariana/query`
- `@ariana/rendering`
- `@ariana/vite-plugin`

### Publish status

Package tarballs are generated locally with `npm pack`. Actual npm publishing requires an authenticated npm account with ownership of the package scope.

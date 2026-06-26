# Changelog

## 0.4.1 - 2026-06-26

### Official npm scope migration

- Prepared official npm publishing under the `@ariana-framework` organization scope.
- Staged publish packages as `@ariana-framework/*@0.4.1`.
- Updated npm package staging so internal workspace package names do not have to be published before install/build.
- Updated docs and release checklist for the `@ariana-framework` scope.

### Packages

- `@ariana-framework/core`
- `@ariana-framework/compiler`
- `@ariana-framework/router`
- `@ariana-framework/forms`
- `@ariana-framework/query`
- `@ariana-framework/rendering`
- `@ariana-framework/vite-plugin`

## 0.4.0 - 2026-06-26

### Official release preparation

- Promoted Ariana packages from alpha to official `0.4.0`.
- Switched npm publishing from the `alpha` tag to the `latest` tag.
- Hardened release verification for root and package versions.
- Hardened npm package staging and tarball validation.
- Fixed CI build, test, and release verification blockers.

### Packages

- `@ariana/core`
- `@ariana/compiler`
- `@ariana/router`
- `@ariana/forms`
- `@ariana/query`
- `@ariana/rendering`
- `@ariana/vite-plugin`

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

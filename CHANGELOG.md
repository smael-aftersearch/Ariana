# Changelog

## 0.4.0 - 2026-06-26

### Official release

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

### Release gates

- Build must pass for all packages and the counter example.
- Unit tests must pass.
- Release verification must pass.
- NPM tarballs must be generated and validated.
- Official publish uses the `latest` npm tag.

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

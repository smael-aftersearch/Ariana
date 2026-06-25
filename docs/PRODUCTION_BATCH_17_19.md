# Production Batch 17 to 19

Completed together:

- GitHub Actions lockfile failure fix
- npm publish workflow hardening
- Vite plugin compiler metadata sync
- benchmark workflow install hardening

## Fixed CI failure

The workflows used npm cache and `npm ci`, but the repository does not currently include a root lockfile. This caused GitHub Actions to fail before build.

The workflows now use `npm install` and no setup-node npm cache until a lockfile is committed.

## Updated workflows

Updated:

- CI
- Browser Benchmark
- Island Benchmark
- Router Production Benchmark
- Compiler Production Benchmark
- npm publish workflow

## Publish workflow

The publish workflow now supports both manual execution and version tag execution.

It runs:

- install
- build
- unit tests
- release verification
- dry-run publish or real publish

## Package metadata

The Vite plugin now declares the compiler package as a peer dependency because the plugin imports compiler diagnostics.

## Next

`prod-20-lockfile-strategy`

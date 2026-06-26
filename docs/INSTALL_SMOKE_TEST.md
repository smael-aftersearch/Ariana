# Install Smoke Test

Ariana must prove that its npm packages can be installed and imported from a clean application.

## Command

```bash
npm run smoke:install
```

## What it does

The smoke test:

1. runs `npm run pack:npm`
2. creates a temporary clean application
3. installs all generated npm tarballs
4. imports the public packages from `@ariana-framework/*`
5. runs basic runtime checks across core, router, forms, query, and rendering

## Why it matters

Unit tests prove package internals. The install smoke test proves package integrity:

- package names are correct
- tarball dependencies are correct
- dist imports are correct
- packages can be consumed outside the monorepo

## Required before publish

A real publish should not happen if this command fails.

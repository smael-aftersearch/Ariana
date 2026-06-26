# Package Integrity

Ariana packages must be safe to install and use from a clean project.

## Current npm scope

Public packages are published under:

```txt
@ariana-framework
```

## Integrity rules

Every publishable package must have:

- correct package name
- correct version
- `main`
- `types`
- built `dist` output
- no workspace-only dependency in the published tarball
- no stale `@ariana/*` import in the published tarball
- install smoke coverage

## Transitional workspace rule

The source workspace may temporarily keep internal `@ariana/*` names for local build compatibility.

The publish staging step must rewrite published package names, dependencies, and dist imports to `@ariana-framework/*`.

## Required checks

Before a real publish:

```bash
npm install
npm run build
npm test
npm run pack:npm
npm run smoke:install
```

## Future CI checks

- inspect tarball package.json
- inspect tarball dist imports
- install tarballs in a temporary app
- import all public packages
- build a real Vite fixture app

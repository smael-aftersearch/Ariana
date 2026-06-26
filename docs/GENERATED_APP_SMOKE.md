# Generated App Smoke Test

The generated app smoke test validates that Ariana packages can be installed from generated tarballs and used inside a fresh Vite application.

## Command

```bash
npm run smoke:generated-app
```

## What it checks

The script:

1. runs `npm run pack:npm`
2. creates a temporary Vite application
3. installs all Ariana package tarballs from `npm-packages`
4. imports `@ariana-framework/core`
5. configures `@ariana-framework/vite-plugin`
6. runs `vite build`

## Why it matters

`smoke:install` proves package imports work in Node.

`smoke:generated-app` proves the packages can participate in a real Vite build outside the monorepo.

## Release rule

Ariana 0.5.0 should not be considered ready until this smoke test passes in CI.

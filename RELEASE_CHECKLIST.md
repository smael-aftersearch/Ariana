# Ariana 0.4.0 Release Checklist

## Before official publish

- Confirm npm scope ownership for `@ariana`.
- Confirm `NPM_TOKEN` exists in GitHub Actions secrets.
- Confirm the npm token has package read/write access.
- If the npm account has 2FA enabled, confirm the token has bypass 2FA enabled.
- If `@ariana` is an npm organization scope, confirm the token has access to that organization.
- Run CI on `main`.
- Run the official npm publish workflow in dry-run mode.
- Confirm package names and versions are all `0.4.0`.
- Confirm changelog and release notes are updated.

## Required commands

```bash
npm install
npm run build
npm test
npm run verify:release
npm run publish:npm:dry
```

## Official publish options

### Option 1: Git tag

```bash
git pull origin main
git tag v0.4.0
git push origin v0.4.0
```

### Option 2: GitHub Actions manual run

Run `Publish official packages to npm` and set `dry_run=false`.

## Release gates

The publish workflow must pass:

- install
- build
- unit tests
- release verification
- tarball generation
- official npm publish

## NPM tag

Official publishing uses the `latest` npm tag.

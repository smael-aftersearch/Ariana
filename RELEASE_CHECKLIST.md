# Ariana 0.4.1 Release Checklist

## Before official publish

- Confirm npm organization/scope ownership for `@ariana-framework`.
- Confirm `NPM_TOKEN` exists in GitHub Actions secrets.
- Confirm the npm token has package read/write access.
- If the npm account has 2FA enabled, confirm the token has bypass 2FA enabled.
- Confirm the token has access to the `ariana-framework` npm organization.
- Run CI on `main`.
- Run the official npm publish workflow in dry-run mode.
- Confirm staged package names and versions are all `@ariana-framework/*@0.4.1`.
- Confirm changelog and release notes are updated.

## Required commands

```bash
npm install
npm run build
npm test
npm run pack:npm
npm run publish:npm:dry
```

## Official publish options

### Option 1: Git tag

```bash
git pull origin main
git tag v0.4.1
git push origin v0.4.1
```

### Option 2: GitHub Actions manual run

Run `Publish official packages to npm` and set `dry_run=false`.

## Release gates

The publish workflow must pass:

- install
- build
- unit tests
- npm package staging
- tarball generation
- dry-run publish or official npm publish

## NPM tag

Official publishing uses the `latest` npm tag.

## Workspace note

The source workspace can keep internal package metadata for local builds. The `pack:npm` script stages official publish packages under the `@ariana-framework` scope before creating tarballs.

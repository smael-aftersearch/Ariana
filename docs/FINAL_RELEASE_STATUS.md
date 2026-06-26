# Ariana 0.4.1 Final Release Status

This document records the final preparation pass for publishing Ariana under the official `@ariana-framework` npm scope.

## Completed

- Created npm organization scope: `@ariana-framework`.
- Prepared staged npm packages as `@ariana-framework/*@0.4.1`.
- Updated package staging so internal workspace dependencies remain local during install/build.
- Updated package staging to rewrite dist imports from `@ariana/*` to `@ariana-framework/*` before tarball creation.
- Updated README, changelog, and release checklist for `@ariana-framework`.
- Updated the publish workflow to run `pack:npm` before dry-run or official publish.

## Release gates

The official publish workflow runs:

1. Install dependencies
2. Build all packages and the counter example
3. Run unit tests
4. Stage official npm packages through `pack:npm`
5. Publish dry-run or official npm publish

## Not executed by the assistant environment

Actual npm publishing was not executed from this environment because authenticated npm access and scope ownership are required.

## How to publish

Use GitHub Actions `Publish official packages to npm` with `dry_run=false`, or push the official tag:

```bash
git pull origin main
git tag v0.4.1
git push origin v0.4.1
```

The GitHub Actions workflow requires `NPM_TOKEN` in repository secrets with access to the `ariana-framework` npm organization.

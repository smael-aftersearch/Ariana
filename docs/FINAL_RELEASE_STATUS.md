# Ariana 0.4.0 Final Release Status

This document records the final preparation pass for the official Ariana 0.4.0 release.

## Completed

- Root release metadata promoted to `0.4.0`.
- All publishable packages promoted to `0.4.0`.
- Internal package dependencies aligned to official release versions.
- Release verification script updated for the official version.
- NPM package staging and tarball validation hardened.
- Publish script switched to the `latest` npm tag.
- GitHub Actions npm publish workflow renamed for official publishing.
- README, changelog, release checklist, and official release notes updated.

## Release gates

The official publish workflow runs:

1. Install dependencies
2. Build all packages and the counter example
3. Run unit tests
4. Run release verification
5. Pack npm tarballs
6. Publish dry-run or official npm publish

## Not executed by the assistant environment

Actual npm publishing was not executed from this environment because authenticated npm access and scope ownership are required.

## How to publish

Use GitHub Actions `Publish official packages to npm` with `dry_run=false`, or push the official tag:

```bash
git pull origin main
git tag v0.4.0
git push origin v0.4.0
```

The GitHub Actions workflow requires `NPM_TOKEN` in repository secrets.

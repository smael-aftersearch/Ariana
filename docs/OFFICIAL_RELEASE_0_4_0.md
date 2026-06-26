# Ariana 0.4.0 Official Release

Ariana 0.4.0 is prepared as the first official npm release line for the current package set.

## Packages

- `@ariana/core`
- `@ariana/compiler`
- `@ariana/router`
- `@ariana/forms`
- `@ariana/query`
- `@ariana/rendering`
- `@ariana/vite-plugin`

## Release version

All packages are aligned to `0.4.0`.

## Release gates

The release workflow runs:

1. Install dependencies
2. Build all packages and the counter example
3. Run unit tests
4. Run release verification
5. Pack npm tarballs
6. Run dry-run publish or official publish

## NPM tag

Official publishing uses the `latest` npm tag.

## Publish trigger

To publish the official release, push a version tag:

```bash
git tag v0.4.0
git push origin v0.4.0
```

Or run the npm publish workflow manually with dry_run set to false.

## Safety note

The workflow requires `NPM_TOKEN` in GitHub Actions secrets for real publishing.

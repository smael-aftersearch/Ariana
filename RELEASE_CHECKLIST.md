# Ariana Release Checklist

## Before publish

- Confirm package scope ownership on npm.
- Configure npm authentication in the publishing environment.
- Run the release verification command.
- Review tarballs under `npm-packages/`.
- Confirm package names and versions.
- Confirm docs and changelog.

## Local release commands

```bash
npm run verify:release
npm run pack:npm
```

## Publish command

```bash
npm run publish:npm
```

## GitHub Actions publish

Add the npm authentication secret in repository settings, then run the npm publish workflow manually.

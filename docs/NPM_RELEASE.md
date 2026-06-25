# Ariana NPM Release Notes

Ariana v4 release-preview packages are npm-ready.

## Packages

```txt
@ariana/core
@ariana/compiler
@ariana/router
@ariana/forms
@ariana/query
@ariana/rendering
@ariana/vite-plugin
```

Version:

```txt
0.4.0-alpha.0
```

## Local package tarballs

Create npm package tarballs:

```bash
npm run build
npm run pack:npm
```

The tarballs are created in:

```txt
npm-packages/
```

## Publish

Publishing requires an authenticated npm account that owns the target scope.

```bash
export NPM_TOKEN=...
npm run publish:npm
```

The release script refuses to publish if `NPM_TOKEN` is missing.

## Important

The assistant environment could not publish to npm because no `NPM_TOKEN` was available and scope ownership could not be verified. The package tarballs and publish script are prepared so the release can be completed from an authenticated environment.

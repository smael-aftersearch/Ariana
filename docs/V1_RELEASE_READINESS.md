# Ariana 1.0 Release Readiness

## Current status

Ariana 1.0 is not published from this document.

The repository now has a 1.0 candidate path, final release gate list, guarded publish commands, and release notes draft. The remaining work is to run the gates and fix any failures.

## Ready areas

- Stable API registry exists.
- Runtime lifecycle contract exists.
- Runtime lifecycle smoke gate exists.
- Compiler diagnostics and formatter APIs exist.
- Template typecheck groundwork exists.
- Template diagnostics CLI exists.
- Vite plugin v1 contract exists.
- Vite plugin resource transform has multi-component and nested metadata coverage.
- Vite plugin options smoke gate exists.
- 1.0 candidate pack helper exists.
- 1.0 publish helper exists with dry-run support.

## Blocking before release

- CI must pass.
- `npm run release:gates:v1` must pass.
- 1.0 candidate tarball pack and inspection must pass.
- Vite plugin options smoke must pass.
- Runtime lifecycle smoke must pass.
- Framework benchmark output must be captured.
- Final release notes must be reviewed.

## Release candidate command

```bash
npm run pack:v1:candidate
```

## Final gate command

```bash
npm run release:gates:v1
```

## Dry-run command

```bash
npm run publish:v1:dry
```

## Release rule

Do not release 1.0 until the user explicitly approves after the gates and dry-run are green.

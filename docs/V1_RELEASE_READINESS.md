# Ariana 1.0 Release Readiness

## Current status

Ariana 1.0 is not published from this document.

The repository now has a 1.0 candidate path and release gates. The remaining work is to run the gates and fix any failures.

## Ready areas

- Stable API registry exists.
- Runtime lifecycle contract exists.
- Compiler diagnostics and formatter APIs exist.
- Template typecheck groundwork exists.
- Template diagnostics CLI exists.
- Vite plugin v1 contract exists.
- Vite plugin resource transform has multi-component and nested metadata coverage.
- 1.0 candidate pack helper exists.

## Blocking before publish

- CI must pass.
- 1.0 candidate tarball pack and inspection must pass.
- Vite plugin options smoke must pass.
- Framework benchmark output must be captured.
- Final release notes must be reviewed.

## Release candidate command

```bash
node scripts/pack-v1-candidate.mjs
```

## Publish rule

Do not publish 1.0 until the user explicitly approves publish after the gates are green.

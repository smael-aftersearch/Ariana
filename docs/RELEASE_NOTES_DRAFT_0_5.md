# Ariana 0.5.0 Release Notes Draft

Ariana 0.5.0 is planned as the next coherent milestone after the first public npm package line.

## Highlights

- stronger npm package integrity checks
- generated app smoke testing with Vite
- Vite component resource transform hardening
- early template typecheck groundwork
- destroyable bootstrap reference
- cleanup scope integration for compiled render context
- FormArray groundwork
- query mutation and invalidation groundwork
- lazy router groundwork
- create-ariana starter skeleton
- benchmark smoke workflow

## Quality gates

0.5.0 should only be tagged after these gates pass:

- main CI
- Vite fixture workflow
- Benchmark Smoke workflow
- tarball inspection
- install smoke
- generated app smoke

## Status

This release should still be presented as an early framework milestone, not as production-ready.

## Performance

Benchmark smoke is included as a regression guard for core signals, router matching, forms array operations, and query cache invalidation.

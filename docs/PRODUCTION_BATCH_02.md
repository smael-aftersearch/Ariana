# Production Batch 02

Step: `prod-02-unit-test-runner`

## Completed

- Added a lightweight unit test runner.
- Added core reactivity unit tests.
- Covered signal, computed, effect, and listSignal.
- Added root test script.
- Added unit tests to CI after build.

## Command

```bash
npm run build
npm test
```

## Covered behavior

- signal read, set, update
- signal subscription cleanup
- computed recalculation
- effect run and cleanup
- listSignal keyed operations
- listSignal change events

## Next step

`prod-03-compiler-snapshot-tests`

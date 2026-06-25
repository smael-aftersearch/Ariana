# Production Batch 06 to 08

Completed together:

- browser benchmark workflow
- Query production features
- Forms async validation features

## Browser benchmark

Added a Playwright-based browser benchmark package and CI workflow.

The browser benchmark measures:

- text node counter updates in Chromium
- keyed list text updates in Chromium

## Query production features

Added:

- stale time
- stale state checking
- in-flight request deduplication
- retry support
- cancellation signal context passed to the loader

## Forms production features

Added:

- async validators
- pending signal
- async errors signal
- async validation on form controls
- async validation aggregation on form groups
- asyncUnique helper

## Tests

Updated unit tests for:

- Query stale time
- Query invalidation
- Query in-flight dedupe
- Query retry
- Query signal context
- Forms async validation
- Forms group async validation

## Notes

The root package script shortcut for browser benchmarks was not added because the connector blocked that package.json update. The benchmark is still executable through its package path and through the browser benchmark workflow.

## Next

`prod-09-rendering-hydration`

# Production Batch 11 to 13

Completed together:

- production router routing
- route data and providers
- router safety tests
- production router benchmark

## Router runtime

Added:

- currentData signal
- currentProviders signal
- route data inheritance
- route-level provider inheritance
- parent-to-child guard chain
- redirect limit protection
- query and hash normalization during navigation

## Tests

Added router tests for:

- normalized navigation with query and hash input
- redirect loop protection
- inherited data
- inherited providers
- parent-before-child guard execution

## Benchmark

Added a production router benchmark with nested route matching, params, route data, and route providers.

## Workflow

Added a router production benchmark workflow for pull requests and manual execution.

## Next

`prod-14-compiler-ast-integration`

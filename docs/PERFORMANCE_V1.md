# Ariana 1.0 Performance Guide

This document explains how Ariana 1.0 performance must be measured. Performance documentation must be numeric. Words like `good`, `bad`, `fast`, or `slow` are only acceptable when they are attached to a measured value.

Ariana must not make broad marketing claims such as `faster than Angular` or `faster than React` without reproducible benchmark results. Performance claims must be tied to a scenario, framework version, environment, build mode, and measurement method.

## Current numeric result

The first Ariana 1.0 numeric baseline is recorded in:

```txt
docs/PERFORMANCE_RESULTS_V1.md
```

Result set:

```txt
ariana-v1-local-gate-001
```

Measured output:

| Rank | Scenario | Ariana 1.0 time | Current gate limit | Limit usage | Numeric reading |
| ---: | --- | ---: | ---: | ---: | --- |
| 1 | Core signal/computed updates | `4.07ms` | `1500ms` | `0.27%` | Fastest measured Ariana smoke path |
| 2 | Query cache operations | `12.07ms` | `1500ms` | `0.80%` | Lightweight in current smoke test |
| 3 | Router repeated matching | `27.73ms` | `1500ms` | `1.85%` | Still far below gate limit |
| 4 | Forms array operations | `497.10ms` | `1500ms` | `33.14%` | Slowest measured Ariana smoke path |

## Current weakness by number

The current numeric weakness is `forms array operations` at `497.10ms`.

| Comparison | Ratio |
| --- | ---: |
| Forms array vs signal/computed | `122.14x` slower |
| Forms array vs query cache | `41.18x` slower |
| Forms array vs router matching | `17.93x` slower |
| Forms array vs current gate limit | uses `33.14%` of the limit |

This makes form array performance the first optimization target after v1 release.

## Current smoke benchmark command

Ariana 1.0 includes an internal benchmark smoke gate:

```bash
npm run bench:smoke
```

The current smoke gate checks these internal scenarios:

| Scenario | What it measures | Current role |
| --- | --- | --- |
| Core signal computed updates | Signal write throughput and computed value correctness | Runtime reactivity sanity check |
| Router repeated matching | Repeated path matching with route params | Router algorithm sanity check |
| Forms array operations | Large form array push and move operations | Forms scalability sanity check |
| Query cache operations | Cache writes and prefix invalidation | Query state sanity check |

These are smoke benchmarks. They prevent obvious regressions, but they are not enough to claim cross-framework superiority.

## Cross-framework comparison matrix

Numbers for Angular, React, Vue, Svelte, and Solid must stay `not measured` until equivalent benchmark fixtures exist and are executed with the same rules.

| Scenario | Metric | Ariana 1.0 | Angular | React | Vue | Svelte | Solid |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Core signal/computed updates | Node-level runtime operation time | `4.07ms` | not measured | not measured | not measured | not measured | not measured |
| Router repeated matching | Node-level route match time | `27.73ms` | not measured | not measured | not measured | not measured | not measured |
| Forms array operations | Node-level form array push/move time | `497.10ms` | not measured | not measured | not measured | not measured | not measured |
| Query cache operations | Node-level cache set/invalidate time | `12.07ms` | not measured | not measured | not measured | not measured | not measured |
| Counter UI update | Browser DOM update time | not measured | not measured | not measured | not measured | not measured | not measured |
| 1,000 row table update | Browser DOM update time | not measured | not measured | not measured | not measured | not measured | not measured |
| 10,000 row stress table | Browser render/update time | not measured | not measured | not measured | not measured | not measured | not measured |
| Form-heavy browser screen | Browser form update/validation time | not measured | not measured | not measured | not measured | not measured | not measured |
| Startup cost | parse/evaluate/first render time | not measured | not measured | not measured | not measured | not measured | not measured |
| Bundle cost | gzip/brotli KB | not measured | not measured | not measured | not measured | not measured | not measured |

A `not measured` value is not a weakness or a strength. It means no repeatable number exists yet.

## Required comparison targets

Ariana performance comparisons must include at least:

| Framework | Why it must be included |
| --- | --- |
| Angular | Enterprise class-based baseline and important comparison target for Ariana's design goals |
| React | Most common component ecosystem baseline |
| Vue | Template-driven progressive framework baseline |
| Svelte | Compile-first framework baseline |
| Solid | Fine-grained signal-based baseline |
| Ariana | Current framework under test |

Angular should be tested in more than one mode when possible:

- default production setup
- optimized production setup using recommended modern Angular performance patterns

This avoids unfair comparisons where one framework is tested in a naive mode and another in an optimized mode.

## Benchmark scenarios for public comparison

### Scenario A: Counter update

Measures frequent state updates with one or more derived values.

Metrics:

- median update time in ms
- p75 update time in ms
- p95 update time in ms
- max update time in ms
- DOM text update latency in ms
- memory after test in MB when available

### Scenario B: 1,000 row table update

Measures keyed row rendering and one-row updates.

Metrics:

- initial render time in ms
- single row update time in ms
- replace all rows time in ms
- remove rows time in ms
- memory after cleanup in MB when available

### Scenario C: 10,000 row stress table

Measures large list performance.

Metrics:

- initial render time in ms
- keyed reorder time in ms
- append time in ms
- delete time in ms
- p95 browser responsiveness in ms

### Scenario D: Form-heavy screen

Measures a large form with validation.

Metrics:

- form creation time in ms
- value update time in ms
- sync validation time in ms
- async validation time in ms
- reset/destroy time in ms
- memory after reset/destroy in MB when available

### Scenario E: Router stress

Measures route matching and navigation.

Metrics:

- match time in ms
- navigation time in ms
- guard chain time in ms
- redirect handling time in ms

### Scenario F: Query cache stress

Measures cache writes and invalidation.

Metrics:

- set 10k items time in ms
- exact invalidation time in ms
- prefix invalidation time in ms
- deduped fetch behavior in ms
- stale check time in ms

### Scenario G: Startup and bundle cost

Measures what users actually pay on page load.

Metrics:

- production bundle size in KB
- gzip size in KB
- brotli size in KB
- parse time in ms
- evaluate time in ms
- first render time in ms
- time to interactive in ms

## Measurement rules

Every comparison must document:

- framework version
- Node version
- browser version
- OS and CPU
- production build command
- dev mode disabled
- source code used for each framework
- number of warmup runs
- number of measured runs
- median, p75, p95, and max result
- bundle size with gzip or brotli
- whether hydration is enabled
- whether devtools/profilers are disabled

Recommended minimum:

```txt
warmup runs: 5
measured runs: 30
reported metrics: median, p75, p95, max
browser: Chromium-based browser in stable channel
mode: production build only
```

## Fairness rules

Do not compare Ariana's best-case with another framework's worst-case.

Rules:

- Angular must be tested with production build.
- React must be tested with production build.
- Vue must be tested with production build.
- Svelte must be tested with production build.
- Solid must be tested with production build.
- Ariana must be tested with production build.
- Use equivalent UI and equivalent data shape.
- Do not include network time unless the test is explicitly about data fetching.
- Keep CSS comparable.
- Keep logging disabled.

## Numeric optimization targets

These targets are for Ariana 1.x optimization work and should be revised after browser benchmarks exist.

| Area | Current Ariana number | First target | Stretch target |
| --- | ---: | ---: | ---: |
| Core signal/computed smoke | `4.07ms` | `< 5ms` | `< 3ms` |
| Query cache smoke | `12.07ms` | `< 15ms` | `< 8ms` |
| Router matching smoke | `27.73ms` | `< 30ms` | `< 15ms` |
| Forms array smoke | `497.10ms` | `< 250ms` | `< 100ms` |

## What can be said publicly today

Allowed:

```txt
Ariana 1.0 signal/computed smoke measured 4.07ms in result set ariana-v1-local-gate-001.
```

Allowed:

```txt
Ariana 1.0 forms array operations are the slowest current smoke scenario at 497.10ms.
```

Not allowed:

```txt
Ariana is faster than Angular, React, Vue, Svelte, and Solid.
```

That claim must not be made until the browser benchmark suite exists and produces repeatable results.

## Next work items

1. Add browser benchmark fixtures for Ariana, Angular, React, Vue, Svelte, and Solid.
2. Add a runner that outputs JSON and Markdown tables.
3. Add CI workflow for benchmark smoke only.
4. Add manual workflow for full benchmark comparison.
5. Publish benchmark source code with results.
6. Add charts to the documentation site after repeatable results exist.
7. Track regressions across releases.
8. Start optimization with forms array operations because the first baseline shows `497.10ms`.

## Summary

Current numeric baseline:

```txt
signal/computed: 4.07ms
query cache: 12.07ms
router matching: 27.73ms
forms array: 497.10ms
```

The largest measured number is `497.10ms` for forms array operations. The next performance task should target that path first, then add comparable browser benchmarks for Angular, React, Vue, Svelte, Solid, and Ariana.

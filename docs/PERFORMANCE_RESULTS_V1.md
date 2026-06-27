# Ariana 1.0 Performance Results

This file is the numeric performance report for Ariana 1.0. It must be updated only with measured numbers. Do not write `good`, `bad`, or `average` without a number next to it.

## Result set 001 — local v1 release gate sample

| Field | Value |
| --- | --- |
| Result set | `ariana-v1-local-gate-001` |
| Ariana version | `1.0.0` |
| Command | `npm run release:gates:v1` |
| Benchmark command inside gate | `npm run bench:smoke` |
| Environment | Local developer machine; hardware not recorded |
| Purpose | First numeric baseline for Ariana 1.0 smoke performance |

## Ariana internal smoke benchmark numbers

| Rank | Scenario | Ariana 1.0 time | Current gate limit | Limit usage | Numeric reading |
| ---: | --- | ---: | ---: | ---: | --- |
| 1 | Core signal/computed updates | `4.07ms` | `1500ms` | `0.27%` | Fastest current measured path |
| 2 | Query cache operations | `12.07ms` | `1500ms` | `0.80%` | Lightweight in current smoke test |
| 3 | Router repeated matching | `27.73ms` | `1500ms` | `1.85%` | Still far below gate limit |
| 4 | Forms array operations | `497.10ms` | `1500ms` | `33.14%` | Slowest current measured path |

## Numeric weakness analysis

The weakest measured area is `forms array operations`.

| Comparison | Ratio |
| --- | ---: |
| Forms array vs signal/computed | `122.14x` slower |
| Forms array vs query cache | `41.18x` slower |
| Forms array vs router matching | `17.93x` slower |
| Forms array vs gate limit | consumes `33.14%` of the allowed smoke limit |

This does not prove forms are slow in real browser applications. It proves that among the currently measured Ariana smoke scenarios, large form array operations are the first performance optimization target.

## Current cross-framework comparison matrix

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

## Numeric targets for the next performance task

These are initial targets for Ariana 1.x optimization work. They should be revised after the browser benchmark suite exists.

| Area | Current Ariana number | First target | Stretch target |
| --- | ---: | ---: | ---: |
| Core signal/computed smoke | `4.07ms` | `< 5ms` | `< 3ms` |
| Query cache smoke | `12.07ms` | `< 15ms` | `< 8ms` |
| Router matching smoke | `27.73ms` | `< 30ms` | `< 15ms` |
| Forms array smoke | `497.10ms` | `< 250ms` | `< 100ms` |

## First optimization priority

Priority 1 is forms array performance.

Reason:

```txt
497.10ms forms array operations
27.73ms router matching
12.07ms query cache operations
4.07ms signal/computed updates
```

The form array path is the largest number and therefore the first target for performance work.

## Required next benchmark implementation

The next benchmark work should create comparable fixtures for:

- Ariana
- Angular
- React
- Vue
- Svelte
- Solid

Each fixture must implement the same scenarios:

1. Counter update
2. 1,000 row table update
3. 10,000 row stress table
4. Form-heavy screen
5. Router stress
6. Query/cache stress where applicable
7. Startup and bundle cost

Each result must report:

```txt
median ms
p75 ms
p95 ms
max ms
gzip KB
brotli KB
memory MB when available
```

## Rule for future documentation

Every performance statement must include a number. Examples:

Allowed:

```txt
Forms array operations are the slowest current smoke case at 497.10ms.
```

Not allowed:

```txt
Forms are slow.
```

Allowed:

```txt
Ariana signal/computed smoke measured 4.07ms in result set ariana-v1-local-gate-001.
```

Not allowed:

```txt
Ariana signals are fast.
```

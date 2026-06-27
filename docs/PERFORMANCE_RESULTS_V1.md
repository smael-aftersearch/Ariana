# Ariana 1.0 Performance Results

This file is the numeric performance report for Ariana 1.0. It must be updated only with measured numbers. Do not write `good`, `bad`, `fast`, `slow`, or `weak` without a comparative number next to it.

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
| 1 | Core signal/computed updates | `4.07ms` | `1500ms` | `0.27%` | Smallest measured Ariana internal smoke number |
| 2 | Query cache operations | `12.07ms` | `1500ms` | `0.80%` | Second smallest measured Ariana internal smoke number |
| 3 | Router repeated matching | `27.73ms` | `1500ms` | `1.85%` | Third smallest measured Ariana internal smoke number |
| 4 | Forms array operations | `497.10ms` | `1500ms` | `33.14%` | Largest measured Ariana internal smoke number |

## What this result proves

This result proves only this:

```txt
Inside Ariana's current internal smoke benchmark, forms array operations produced the largest number: 497.10ms.
```

This result does **not** prove this:

```txt
Ariana forms are slower than Angular, React, Vue, Svelte, or Solid.
```

A competitive weakness can only be claimed after equivalent benchmark scenarios are executed for the other frameworks.

## Internal-only ratio analysis

These ratios compare Ariana paths against other Ariana paths. They do not compare Ariana against another framework.

| Comparison | Ratio |
| --- | ---: |
| Ariana forms array vs Ariana signal/computed | `122.14x` larger |
| Ariana forms array vs Ariana query cache | `41.18x` larger |
| Ariana forms array vs Ariana router matching | `17.93x` larger |
| Ariana forms array vs current gate limit | consumes `33.14%` of the allowed smoke limit |

This means forms array operations are the first internal Ariana path to inspect. It does not yet mean they are worse than another framework.

## Current cross-framework comparison matrix

The real cross-framework benchmark runner now exists:

```bash
npm run build
npm run bench:framework
```

It writes:

```txt
benchmarks/framework-comparison/results/latest.json
benchmarks/framework-comparison/results/latest.md
```

Until that command is run and the output is committed or copied into this file, cross-framework columns must not be filled with guessed numbers.

| Scenario | Metric | Ariana 1.0 | Angular | React | Vue | Svelte | Solid |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Core signal/computed updates | Node-level runtime operation time | `4.07ms` | pending benchmark run | pending benchmark run | pending benchmark run | pending benchmark run | pending benchmark run |
| Router repeated matching | Node-level route match time | `27.73ms` | not equivalent in current runner | not equivalent in current runner | not equivalent in current runner | not equivalent in current runner | not equivalent in current runner |
| Forms array operations | Node-level form array push/move time | `497.10ms` | pending benchmark run | equivalent-state runner pending | equivalent-state runner pending | equivalent-state runner pending | equivalent-state runner pending |
| Query cache operations | Node-level cache set/invalidate time | `12.07ms` | not equivalent in current runner | not equivalent in current runner | not equivalent in current runner | not equivalent in current runner | not equivalent in current runner |
| Counter UI update | Browser DOM update time | pending browser suite | pending browser suite | pending browser suite | pending browser suite | pending browser suite | pending browser suite |
| 1,000 row table update | Browser DOM update time | pending browser suite | pending browser suite | pending browser suite | pending browser suite | pending browser suite | pending browser suite |
| 10,000 row stress table | Browser render/update time | pending browser suite | pending browser suite | pending browser suite | pending browser suite | pending browser suite | pending browser suite |
| Startup cost | parse/evaluate/first render time | pending browser suite | pending browser suite | pending browser suite | pending browser suite | pending browser suite | pending browser suite |
| Bundle cost | gzip/brotli KB | pending browser suite | pending browser suite | pending browser suite | pending browser suite | pending browser suite | pending browser suite |

## Numeric targets for the next performance task

These are internal optimization targets, not competitive claims.

| Area | Current Ariana number | First internal target | Stretch internal target |
| --- | ---: | ---: | ---: |
| Core signal/computed smoke | `4.07ms` | keep `< 5ms` | `< 3ms` |
| Query cache smoke | `12.07ms` | keep `< 15ms` | `< 8ms` |
| Router matching smoke | `27.73ms` | keep `< 30ms` | `< 15ms` |
| Forms array smoke | `497.10ms` | inspect and try `< 250ms` | try `< 100ms` |

The forms target is an internal target because `497.10ms` is the largest Ariana internal number. If Angular FormArray or other comparable implementations are also near this range or higher, the priority may change.

## Required next benchmark implementation

The first cross-framework runner has been added under:

```txt
benchmarks/framework-comparison
```

It measures:

1. `derived-counter`
2. `array-push-move`

Frameworks included:

- Ariana
- Angular
- React
- Vue
- Svelte
- Solid

Important implementation note:

```txt
Ariana and Angular use official form-array implementations in array-push-move.
React, Vue, Svelte, and Solid use framework-state array equivalents because they do not ship a directly equivalent official FormArray in core.
```

## Rule for future documentation

Every performance statement must include a number and a comparison target.

Allowed:

```txt
Ariana FormArray measured 497.10ms in ariana-v1-local-gate-001.
```

Allowed only after benchmark results exist:

```txt
Ariana FormArray measured Xms and Angular FormArray measured Yms in framework-comparison result set Z.
```

Not allowed:

```txt
Ariana forms are weak.
```

Not allowed:

```txt
Ariana is faster than Angular.
```

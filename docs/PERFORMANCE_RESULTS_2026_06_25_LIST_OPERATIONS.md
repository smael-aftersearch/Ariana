# Ariana Performance Results - listSignal operations - 2026-06-25

This benchmark matches the latest compiler/runtime batch: compiled `@for` handles targeted `listSignal` update, insert, and remove change events.

## Changes tested

This batch improves the listSignal-driven compiled `@for` path:

- update changes update only the affected keyed row.
- insert changes create one new row record and place its DOM nodes at the requested index.
- remove changes destroy only the removed keyed row.
- clear support exists in the generated change handler.
- rows that do not use `$index` skip tail index updates for insert/remove.

For non-listSignal sources, compiled `@for` still uses the normal effect-based list sync path.

## Environment

```txt
Runtime: Node.js 22.16.0
DOM: jsdom 29.1.1
Rows: 300
Iterations: 30
Warmup: 10
Runs: 3
Scenario: keyed list operation on one row per update
```

## Median results

| Operation | Rank | Strategy | Median avg cost |
|---|---:|---|---:|
| insert | 1 | Vanilla keyed DOM | 99.104 us/op |
| insert | 2 | Ariana @for + listSignal | 938.309 us/op |
| insert | 3 | Ariana @for + normal signal | 4,572.435 us/op |
| remove | 1 | Vanilla keyed DOM | 7.823 us/op |
| remove | 2 | Ariana @for + listSignal | 52.119 us/op |
| remove | 3 | Ariana @for + normal signal | 66,801.360 us/op |
| update | 1 | Ariana @for + listSignal | 54.720 us/op |
| update | 2 | Vanilla keyed DOM | 106.503 us/op |
| update | 3 | Ariana @for + normal signal | 760.983 us/op |

## Raw run values

| Operation | Strategy | Run values |
|---|---|---|
| insert | Vanilla keyed DOM | 93.778, 99.104, 199.631 |
| insert | Ariana @for + listSignal | 797.026, 938.309, 1,008.058 |
| insert | Ariana @for + normal signal | 4,530.942, 4,572.435, 4,693.709 |
| remove | Vanilla keyed DOM | 7.586, 7.823, 9.395 |
| remove | Ariana @for + listSignal | 50.570, 52.119, 52.460 |
| remove | Ariana @for + normal signal | 66,483.074, 66,801.360, 68,071.592 |
| update | Ariana @for + listSignal | 54.026, 54.720, 115.204 |
| update | Vanilla keyed DOM | 75.121, 106.503, 109.424 |
| update | Ariana @for + normal signal | 582.034, 760.983, 781.076 |

## Interpretation

The targeted listSignal path is much faster than the normal signal path for all three operations.

```txt
update: 760.983 -> 54.720 us/op
insert: 4,572.435 -> 938.309 us/op
remove: 66,801.360 -> 52.119 us/op
```

The biggest improvement is remove, because the normal signal path performs repeated full list sync work while the listSignal path destroys only the removed keyed row.

Insert is improved, but it is still the next bottleneck. The current insert path creates a row from a template clone and places it in the DOM. That is much better than a full sync, but still slower than direct Vanilla DOM.

## Engineering conclusion

This batch confirms that listSignal-driven `@for` is the right direction.

The next work should focus on:

1. faster row creation for insert operations
2. fragment/template caching for compiled rows
3. reorder-specific operations and benchmarks
4. real template AST groundwork
5. browser automation benchmarks

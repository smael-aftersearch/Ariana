# Ariana Performance Results - listSignal targeted scheduling - 2026-06-25

This benchmark matches the latest runtime change: `listSignal()` targeted list updates.

## Change tested

A new core primitive, `listSignal()`, was added. It keeps the normal signal API and adds targeted list operations such as `updateByKey()` and `subscribeChanges()`.

The goal is to give compiled `@for` a future scheduling primitive that can avoid scanning every row when the mutation shape is known.

## Environment

```txt
Runtime: Node.js 22.16.0
Rows: 300
Iterations: 50,000
Warmup: 5,000
Runs: 5
Scenario: targeted update of one keyed row
```

## Median results

| Rank | Strategy | Median cost |
|---:|---|---:|
| 1 | Map direct targeted update | 0.226 us/update |
| 2 | Ariana listSignal updateByKey | 1.183 us/update |
| 3 | Array full scan update | 4.214 us/update |

## Raw run values

| Strategy | Run values |
|---|---|
| Map direct targeted update | 0.233, 0.226, 0.226, 0.150, 0.146 |
| Ariana listSignal updateByKey | 1.257, 0.880, 1.035, 1.311, 1.183 |
| Array full scan update | 4.715, 4.213, 4.718, 4.140, 4.214 |

## Interpretation

`listSignal.updateByKey()` is about 3.56x faster than scanning and copying a 300-row array in this targeted scheduling benchmark.

```txt
Array full scan update:        4.214 us/update
Ariana listSignal updateByKey: 1.183 us/update
```

The direct `Map` update remains faster because it is the bare minimum baseline and does not provide signal semantics or subscriber notification.

## Engineering conclusion

The direction is valid. `listSignal()` gives Ariana the runtime primitive needed for the next compiler step:

```txt
compiled @for + listSignal source
  -> subscribe to targeted list changes
  -> update only the affected keyed row
  -> avoid scanning the full list on each targeted update
```

Next work:

1. Teach compiled `@for` to detect and subscribe to listSignal changes.
2. Add a DOM benchmark where listSignal drives compiled keyed rows directly.
3. Add insert/remove/reorder benchmarks.

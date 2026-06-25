# Ariana Performance Results - compiled @for plus listSignal - 2026-06-25

This benchmark matches the latest compiler/runtime integration: compiled `@for` now detects `listSignal` sources and subscribes to targeted list changes.

## Change tested

The previous version added `listSignal()` as a runtime primitive, but compiled `@for` still used the normal list effect path.

This version connects the two pieces:

```txt
compiled @for + listSignal source
  -> initial keyed DOM sync
  -> subscribeChanges()
  -> update only the changed keyed row for update events
```

For non-listSignal sources, compiled `@for` still falls back to the normal effect-based sync path.

## Environment

```txt
Runtime: Node.js 22.16.0
DOM: jsdom 29.1.1
Rows: 300
Iterations: 50
Warmup: 5
Runs: 3
Scenario: keyed list with one changed row per update
```

## Median results

| Rank | Framework | Median avg update cost |
|---:|---|---:|
| 1 | Ariana @for + listSignal targeted | 63.368 us/update |
| 2 | Vanilla keyed DOM | 86.982 us/update |
| 3 | Ariana keyed @for compiler | 694.853 us/update |
| 4 | Angular @for signal + detectChanges | 738.181 us/update |
| 5 | Vue keyed v-for nextTick | 1,216.397 us/update |
| 6 | React keyed list flushSync | 8,057.350 us/update |
| 7 | Ariana recreate list | 10,875.942 us/update |

## Raw run values

| Framework | Run values |
|---|---|
| Ariana @for + listSignal targeted | 54.548, 63.368, 88.087 |
| Vanilla keyed DOM | 73.946, 86.982, 133.082 |
| Ariana keyed @for compiler | 692.296, 694.853, 833.012 |
| Angular @for signal + detectChanges | 465.792, 738.181, 1136.121 |
| Vue keyed v-for nextTick | 1201.284, 1216.397, 1281.601 |
| React keyed list flushSync | 5083.618, 8057.350, 8352.399 |
| Ariana recreate list | 10525.276, 10875.942, 11112.296 |

## Comparison with previous stage

Previous fast row-binding median:

```txt
750.547 us/update
```

New compiled `@for` plus `listSignal` median:

```txt
63.368 us/update
```

That is roughly an 11.85x improvement over the previous Ariana list compiler path in this jsdom benchmark.

## Interpretation

This is the biggest list-performance improvement so far.

The result shows that the bottleneck really was list-level scheduling. Once compiled `@for` can receive targeted list changes, Ariana no longer needs to scan all 300 rows for update-by-key operations.

Ariana is faster than React, Vue, Angular, and the previous Ariana list paths in this targeted list-update benchmark.

## Limitations

- This runs in jsdom, not a real browser.
- This is a small benchmark, not a full application benchmark.
- Insert/remove/clear still fall back to full sync in this compiler preview.
- The compiler is still string/regex-based and needs a real template AST.
- Browser automation is still required.

## Engineering conclusion

The direction is valid.

The next useful batch of work should include:

1. Optimized insert/remove handling for listSignal-driven `@for`.
2. Reorder-specific benchmark cases.
3. Real template AST groundwork.
4. Browser benchmark automation.

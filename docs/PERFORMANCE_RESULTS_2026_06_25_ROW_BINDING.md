# Ariana Performance Results - row binding - 2026-06-25

This benchmark records the latest list-update test after adding direct row update functions for simple compiled `@for` bodies.

## Change tested

Simple loop rows now use a generated `update()` function on each row record. Complex rows still use the signal-based row path.

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
| 1 | Vanilla keyed DOM | 123.085 us/update |
| 2 | Angular list | 632.984 us/update |
| 3 | Ariana keyed list compiler | 750.547 us/update |
| 4 | Vue keyed list | 1,179.597 us/update |
| 5 | React keyed list | 8,567.691 us/update |
| 6 | Ariana recreate list | 11,416.413 us/update |

## Raw run values

| Framework | Run values |
|---|---|
| Vanilla keyed DOM | 116.310, 123.085, 141.015 |
| Angular list | 400.037, 632.984, 929.399 |
| Ariana keyed list compiler | 692.463, 750.547, 751.880 |
| Vue keyed list | 1,097.239, 1,179.597, 1,484.792 |
| React keyed list | 5,353.633, 8,567.691, 9,251.199 |
| Ariana recreate list | 10,516.831, 11,416.413, 11,590.614 |

## Comparison

Previous keyed list median:

```txt
772.252 us/update
```

New row-binding median:

```txt
750.547 us/update
```

This is about 2.8 percent better in this jsdom benchmark.

## Conclusion

The row update path improved slightly, but the next bottleneck is list-level scheduling because the list effect still scans all 300 rows on each update.

# Framework Comparison Benchmark

This benchmark exists to prevent subjective performance claims.

It measures Ariana against Angular, React, Vue, Svelte, and Solid with numeric output.

## Run

From the repository root:

```bash
npm run build
npm run bench:framework
```

The command installs benchmark dependencies inside this folder and runs:

```bash
node src/framework-comparison.mjs
```

## Outputs

The runner writes:

```txt
benchmarks/framework-comparison/results/latest.json
benchmarks/framework-comparison/results/latest.md
```

## Current scenarios

### `derived-counter`

Measures repeated update of a value and read of a derived value.

Framework implementations:

| Framework | Implementation |
| --- | --- |
| Ariana | `signal` + `computed` |
| Angular | `signal` + `computed` |
| Solid | `createSignal` + `createMemo` |
| Vue | `ref` + `computed` |
| Svelte | `writable` + `derived` |
| React | `createElement` render-object baseline, not React DOM state |

React does not provide a built-in signal/computed primitive equivalent in core. The React number should be interpreted separately.

### `array-push-move`

Measures push of 2,000 items and 50 moves of last item to first item.

Framework implementations:

| Framework | Implementation |
| --- | --- |
| Ariana | official `formArray` + `formControl` |
| Angular | official `FormArray` + `FormControl` |
| React | immutable array state equivalent |
| Vue | `ref([])` array state equivalent |
| Svelte | `writable([])` array state equivalent |
| Solid | `createSignal([])` array state equivalent |

Only Ariana and Angular have official form-array implementations in this benchmark. React, Vue, Svelte, and Solid are measured with framework-state array equivalents.

## Environment variables

```txt
ARIA_BENCH_COUNTER_ITERATIONS=50000
ARIA_BENCH_ARRAY_SIZE=2000
ARIA_BENCH_ARRAY_MOVES=50
ARIA_BENCH_WARMUP=5000
ARIA_BENCH_ROUNDS=10
```

## Result rules

- Do not call a path strong or weak without a comparative number.
- Do not compare Ariana form arrays directly against React/Vue/Svelte/Solid array-state equivalents without explaining the implementation difference.
- Do not claim Ariana is faster than another framework unless the relevant scenario has measured median/p75/p95/max values.

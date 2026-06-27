# Ariana Framework Performance Comparison

This report defines the comparison benchmark for Ariana against other frontend ecosystems.

## Compared frameworks

- Ariana signals
- Solid signals
- Vue reactivity
- Svelte store
- React createElement baseline

## Benchmark type

The current benchmark is a reactivity/update micro-benchmark, not a full browser rendering benchmark.

It measures repeated update propagation through each framework's closest lightweight primitive:

- Ariana: `signal`, `computed`, `effect`
- Solid: `createSignal`, `createMemo`, `createEffect`
- Vue: `ref`, `computed`, `effect`
- Svelte: `writable`, `derived`
- React: `createElement` baseline without React DOM reconciliation

## Command

```bash
npm run build
npm --prefix benchmarks/framework-comparison install --no-audit --no-fund
npm --prefix benchmarks/framework-comparison run bench
```

## Workflow

```txt
.github/workflows/framework-bench.yml
```

The workflow runs on pull requests to `main`.

## Report format

The benchmark prints a table:

```txt
framework | best_ms | avg_ms | final_value
```

## Important interpretation

This benchmark does not prove overall framework superiority.

It only compares a narrow update path. Real UI performance also depends on:

- DOM rendering strategy
- compiler output
- hydration behavior
- list reconciliation
- event binding cleanup
- browser scheduling
- application architecture

## Current status

The comparison suite has been added. Real numbers must come from running the workflow or command in a clean environment.

No numeric performance claim should be published until those results are captured and reviewed.

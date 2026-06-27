# Ariana 1.0 Performance Guide

Ariana performance documentation must be numeric. Do not describe a path as `good`, `bad`, `fast`, `slow`, or `weak` unless the statement includes a measured number and the comparison target.

## Required command

Run the complete framework comparison benchmark:

```bash
npm run build
npm run bench:framework
```

This command measures Ariana, Angular, React, Vue, Svelte, and Solid. The generated report is written to:

```txt
benchmarks/framework-comparison/results/latest.json
benchmarks/framework-comparison/results/latest.md
```

The GitHub Actions workflow also copies the Markdown result into:

```txt
docs/PERFORMANCE_RESULTS_V1.md
```

## Benchmark scenarios

The framework comparison runner must output numbers for every framework in every listed scenario. A scenario should not appear in the generated report unless it has numeric output for all frameworks.

Current measured scenarios:

| Scenario | What it measures | Frameworks |
| --- | --- | --- |
| `derived-counter` | repeated value update and derived value read | Ariana, Angular, React, Vue, Svelte, Solid |
| `list-1000-update` | immutable updates over a 1,000 item list | Ariana, Angular, React, Vue, Svelte, Solid |
| `list-10000-move` | immutable last-to-first moves over a 10,000 item list | Ariana, Angular, React, Vue, Svelte, Solid |
| `array-push-move` | form-array or equivalent state-array push/move | Ariana, Angular, React, Vue, Svelte, Solid |

## Interpretation rules

### Rule 1: a number is only meaningful against a comparison target

`497.10ms` by itself does not mean a path is weak. It only becomes meaningful when compared with an equivalent Angular, React, Vue, Svelte, Solid, or Ariana baseline under the same benchmark rules.

### Rule 2: internal comparison is not competitive comparison

If Ariana FormArray is larger than Ariana signal/computed, that is an internal observation. It does not prove Ariana FormArray is worse than Angular FormArray or any other framework.

### Rule 3: React is different in some scenarios

React core does not ship a direct signal/computed primitive or official FormArray equivalent. For those scenarios the runner uses a documented React baseline/equivalent. The report must preserve that note.

### Rule 4: array/form comparison must state the implementation

Ariana and Angular use official form-array implementations in `array-push-move`. React, Vue, Svelte, and Solid use framework-state array equivalents because they do not ship a directly equivalent official FormArray in core.

## GitHub Actions

The workflow is:

```txt
.github/workflows/framework-benchmark.yml
```

Push-triggered and manual workflow runs execute the framework benchmark, copy `benchmarks/framework-comparison/results/latest.md` into `docs/PERFORMANCE_RESULTS_V1.md`, commit the numeric benchmark results, and upload them as an artifact.

## Performance optimization workflow

1. Run `npm run bench:framework`.
2. Read `docs/PERFORMANCE_RESULTS_V1.md`.
3. Pick the scenario where Ariana is behind the best framework by the largest numeric ratio.
4. Optimize that path.
5. Run the benchmark again.
6. Commit the before/after numbers.

## Public claim rule

Allowed:

```txt
In benchmark result X, Ariana measured 12.34ms and Angular measured 18.90ms for scenario Y.
```

Not allowed:

```txt
Ariana is faster than Angular.
```

A broad claim is only allowed when it is backed by specific scenario tables and measured numbers.

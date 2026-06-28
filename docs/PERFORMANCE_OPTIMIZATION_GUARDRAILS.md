# Ariana Performance Optimization Guardrails

Performance work must preserve Ariana's framework contracts. A faster implementation is only acceptable when it keeps the public API, reactivity semantics, lifecycle behavior, and observable form/list behavior stable.

## Non-negotiable rules

1. Do not change public API behavior to win a benchmark.
2. Do not special-case benchmark scenarios inside framework source code.
3. Do not skip notifications that user code can observe.
4. Do not keep stale computed values after dependency changes.
5. Do not leak subscriptions when computed/effect dependencies change conditionally.
6. Do not expose mutable internal stores as stable public snapshots.
7. Do not break existing import paths, exported types, or package contracts.
8. Do not accept a performance gain unless unit tests, typecheck, and benchmarks can all pass.

## Required validation before keeping a performance change

Run these checks after each performance change:

```bash
npm run build
npm test
npm run typecheck
npm run bench:framework
```

For core reactivity changes, also run:

```bash
npm run bench:ariana-core
```

## Reactivity contract

A `signal` update must notify current subscribers exactly according to the established runtime semantics.

A `computed` value may be lazy, but it must still:

- return the latest value when read,
- propagate invalidation to observers,
- update dependency subscriptions when conditional branches change,
- avoid duplicate subscriptions for stable dependencies,
- clean up removed dependencies.

An `effect` must still:

- run initially,
- rerun after observed dependencies change,
- run user cleanup before rerun,
- run user cleanup on dispose,
- stop observing after dispose.

## Forms contract

A `formArray` may use an internal mutable store for performance, but public reads must preserve snapshot expectations.

Specifically:

- a previously returned `controls()` snapshot must not grow when `push` is called later,
- `controls.update` must receive a snapshot, not the internal mutable store,
- `move` must preserve `length`,
- `value()` must reflect current control order,
- validation behavior must remain unchanged.

## Benchmark interpretation

The benchmark is a guide, not the contract. A benchmark win is valid only when the framework behavior remains correct.

Use `docs/PERFORMANCE_RESULTS_V1.md` as the current measurement baseline, not as permission to weaken semantics.

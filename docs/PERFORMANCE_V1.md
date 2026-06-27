# Ariana 1.0 Performance Guide

This document explains how Ariana 1.0 performance should be measured, what is currently covered by the repository, how Ariana should be compared with other JavaScript frameworks, and which performance areas are currently strong, weak, or still unproven.

Ariana must not make broad marketing claims such as "faster than Angular" or "faster than React" without reproducible benchmark results. Performance claims should be tied to a specific scenario, environment, framework configuration, and measurement method.

## Current status

Ariana 1.0 includes an internal benchmark smoke gate:

```bash
npm run bench:smoke
```

The current smoke gate checks these internal scenarios:

| Scenario | What it measures | Current role |
| --- | --- | --- |
| Core signal computed updates | Signal write throughput and computed value correctness | Runtime reactivity sanity check |
| Router repeated matching | Repeated path matching with route params | Router algorithm sanity check |
| Forms array operations | Large form array push and move operations | Forms scalability sanity check |
| Query cache operations | Cache writes and prefix invalidation | Query state sanity check |

These are smoke benchmarks. They are useful for preventing obvious regressions, but they are not enough to claim cross-framework superiority.

## Latest local v1 gate sample

A local v1 gate run produced this sample output:

```txt
core signal computed updates: 4.07ms
router repeated matching: 27.73ms
forms array operations: 497.10ms
query cache operations: 12.07ms
```

This sample is useful as a release signal, not as a universal benchmark. Hardware, Node version, OS, CPU state, and background processes can change these numbers.

## What Ariana 1.0 is good at today

### 1. Fine-grained reactive state

Ariana uses signals and computed values. This is expected to be strong for scenarios where a small piece of state updates frequently and only dependent work should re-run.

Good scenarios:

- counter updates
- small dashboard widgets
- field-level UI state
- computed labels and status fields
- local component state

### 2. Explicit lifecycle cleanup

Ariana tracks cleanup explicitly. This is important for event listeners, effects, child rendering, and component teardown.

Good scenarios:

- components that mount/unmount frequently
- event-heavy UI
- dynamic child rendering
- repeated conditionals and list sections

### 3. Query cache operations

The v1 query cache has simple and predictable state operations: set, stale checks, invalidation, deduped fetches, and retry. The smoke result shows this area is currently lightweight in Node-level checks.

Good scenarios:

- small and medium query caches
- exact invalidation
- prefix invalidation
- request deduplication

### 4. Router matching

The router has a small explicit matching model with route params, route data, providers, guards, and nested route matching. The smoke result shows repeated matching is currently lightweight for the tested route shape.

Good scenarios:

- route tables with simple static and parameterized routes
- guard chains
- route data inheritance
- route provider inheritance

### 5. Package size discipline

Ariana is split into focused packages. Applications can install only the packages they need.

Good scenarios:

- small applications
- custom stacks
- apps that need core runtime but not forms/query/rendering

## Where Ariana 1.0 is weaker or not proven yet

### 1. Browser DOM benchmark is not complete yet

The current benchmark smoke is Node-level. It does not yet compare real browser DOM operations against Angular, React, Vue, Svelte, Solid, or other frameworks.

Not proven yet:

- 10k row browser rendering
- keyed list replacement
- DOM patch latency
- hydration cost
- browser memory retention
- startup parse/evaluate time

### 2. Forms array operations are the heaviest current smoke case

The sample local v1 gate shows forms array operations as the slowest internal smoke scenario. This does not mean forms are too slow for real apps, but it shows that large dynamic form arrays should be watched closely.

Needs more measurement:

- 100 controls
- 1,000 controls
- nested groups and arrays
- async validation under load
- repeated move/remove operations

### 3. Template compiler coverage is still early

Ariana has compiler diagnostics and Vite integration, but v1 template compilation is still an early foundation compared with mature framework compilers.

Needs more measurement:

- template compile time
- large template diagnostics time
- template typecheck time
- source map quality
- incremental rebuild performance

### 4. Ecosystem maturity is lower than established frameworks

Angular, React, Vue, Svelte, and Solid have mature tooling, ecosystem integrations, devtools, profiling patterns, and battle-tested production usage. Ariana v1 is a foundation release.

Not a runtime speed issue, but still a production-performance factor:

- debugging tools
- profiling tools
- IDE integrations
- production recipes
- SSR/hydration maturity

## Required comparison targets

Ariana performance comparisons should include at least:

| Framework | Why it must be included |
| --- | --- |
| Angular | Enterprise class-based baseline and important comparison target for Ariana's design goals |
| React | Most common component ecosystem baseline |
| Vue | Template-driven progressive framework baseline |
| Svelte | Compile-first framework baseline |
| Solid | Fine-grained signal-based baseline |
| Ariana | Current framework under test |

Angular should be tested in more than one mode when possible:

- default production setup
- optimized setup using the recommended modern Angular performance patterns

This avoids unfair comparisons where one framework is tested in a naive mode and another in an optimized mode.

## Benchmark scenarios for public comparison

### Scenario A: Counter update

Measures frequent state updates with one or more derived values.

Metrics:

- update time
- DOM text update latency
- memory allocations
- CPU time

### Scenario B: 1,000 row table update

Measures keyed row rendering and one-row updates.

Metrics:

- initial render time
- single row update time
- replace all rows time
- remove rows time
- memory after cleanup

### Scenario C: 10,000 row stress table

Measures large list performance.

Metrics:

- initial render time
- keyed reorder time
- append time
- delete time
- browser responsiveness

### Scenario D: Form-heavy screen

Measures a large form with validation.

Metrics:

- form creation time
- value update time
- validation time
- async validation behavior
- memory after reset/destroy

### Scenario E: Router stress

Measures route matching and navigation.

Metrics:

- match time
- navigation time
- guard chain time
- redirect handling

### Scenario F: Query cache stress

Measures cache writes and invalidation.

Metrics:

- set 10k items
- exact invalidation
- prefix invalidation
- deduped fetch behavior
- stale checks

### Scenario G: Startup and bundle cost

Measures what users actually pay on page load.

Metrics:

- production bundle size
- gzip/brotli size
- parse time
- evaluate time
- first render time
- time to interactive

## Measurement rules

Every comparison must document:

- framework version
- Node version
- browser version
- OS and CPU
- production build command
- dev mode disabled
- source code used for each framework
- number of warmup runs
- number of measured runs
- median, p75, p95, and worst result
- bundle size with gzip or brotli
- whether hydration is enabled
- whether devtools/profilers are disabled

Recommended minimum:

```txt
warmup runs: 5
measured runs: 30
reported metrics: median, p75, p95, max
browser: Chromium-based browser in stable channel
mode: production build only
```

## Fairness rules

Do not compare Ariana's best-case with another framework's worst-case.

Rules:

- Angular must be tested with production build.
- React must be tested with production build.
- Vue must be tested with production build.
- Svelte must be tested with production build.
- Solid must be tested with production build.
- Ariana must be tested with production build.
- Use equivalent UI and equivalent data shape.
- Do not include network time unless the test is explicitly about data fetching.
- Keep CSS comparable.
- Keep logging disabled.

## Ariana 1.0 performance position

| Area | Current position | Confidence |
| --- | --- | --- |
| Signal/computed updates | Strong in current smoke benchmark | Medium |
| Query cache operations | Strong in current smoke benchmark | Medium |
| Router matching | Good in current smoke benchmark | Medium |
| Forms array operations | Functional but currently the heaviest smoke benchmark | Medium |
| Browser DOM rendering | Not proven by public comparison yet | Low |
| Initial load and bundle comparison | Not proven by public comparison yet | Low |
| Hydration comparison | Not implemented as a full public benchmark yet | Low |
| Template diagnostics | Strong as a correctness gate, performance needs more measurement | Medium-low |

## What can be said publicly today

Safe statement:

```txt
Ariana 1.0 is designed for low framework overhead through signal-based reactivity, explicit lifecycle cleanup, external templates, and focused packages. The repository includes internal performance smoke checks for core signals, routing, forms, and query cache operations. Cross-framework browser benchmarks are planned and should be interpreted only when run through the documented benchmark matrix.
```

Unsafe statement:

```txt
Ariana is faster than Angular, React, Vue, Svelte, and Solid.
```

That claim must not be made until the browser benchmark suite exists and produces repeatable results.

## Next work items

1. Add browser benchmark fixtures for Ariana, Angular, React, Vue, Svelte, and Solid.
2. Add CI workflow for benchmark smoke only.
3. Add manual workflow for full benchmark comparison.
4. Publish benchmark source code with results.
5. Add charts to the documentation site after repeatable results exist.
6. Track regressions across releases.

## Summary

Ariana 1.0 currently looks strongest in focused runtime operations: signals, query cache, and simple router matching. The main watch area is large form arrays. The biggest missing piece is a reproducible browser-level comparison suite against Angular, React, Vue, Svelte, and Solid.

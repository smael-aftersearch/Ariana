# Ariana Production Readiness Plan

Ariana is currently alpha-ready and release-ready for preview packages. It is not yet production-complete.

## Production definition

Ariana can be called production-ready only when these gates pass:

1. The compiler is AST-based end-to-end.
2. Runtime APIs are stable and documented.
3. Router supports nested outlets, route guards, route metadata, and route-level providers.
4. Forms support sync validators, async validators, incremental group validation, touched/dirty state, and template integration.
5. Query supports retry, cancellation, stale time, deduplication, invalidation, and error states.
6. Rendering supports SSR shell output, route-based SSG, island activation, and hydration strategy.
7. Browser benchmarks run in CI.
8. Unit, integration, and browser tests run in CI.
9. Bundle size and chunk count are measured in CI.
10. Public docs include getting started, API reference, examples, migration notes, and known limitations.

## Production milestones

### Milestone P1: Production Gate Infrastructure

- release workflow
- release checklist
- automated package verification
- browser benchmark workflow
- package tarball verification
- changelog and security docs

### Milestone P2: Compiler stabilization

- move Vite plugin codegen to `@ariana/compiler`
- support real AST for elements, attributes, bindings, `@if`, `@else`, `@for`, events, and components
- add compiler diagnostics
- add source-location metadata
- add compiler unit tests

### Milestone P3: Runtime API stability

- freeze public exports
- add API docs
- add compatibility tests
- add regression tests for signals, effects, listSignal, DI, bootstrap, and compiled render

### Milestone P4: Enterprise layer completion

- nested routing and outlets
- route-level providers
- async route guards
- form async validators
- query cancellation/retry/dedup/stale time

### Milestone P5: Rendering layer completion

- route-based SSG
- SSR component rendering path
- island activation runtime
- hydration strategy
- rendering benchmarks

### Milestone P6: Production validation

- demo admin app built with Ariana
- browser benchmark dashboard
- package install smoke tests
- public alpha release
- beta hardening cycle

## Current status

Ariana is ready for:

- local evaluation
- internal experiments
- alpha package publishing
- prototype admin applications

Ariana is not yet ready for:

- production customer-facing applications
- long-term public API guarantees
- framework-wide ecosystem adoption

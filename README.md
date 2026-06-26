# Ariana Framework

**Ariana** is a TypeScript-first, class-based frontend framework for building structured UI applications with signal-based reactivity, compiler-assisted templates, and explicit rendering paths.

Ariana keeps the disciplined class-based developer experience many Angular developers like, while removing historical pieces that are not needed in a new framework:

- no `NgModule`
- no `standalone: true`
- no Zone.js
- no global change detection
- no Virtual DOM
- external HTML/CSS by default

In Ariana, every component is independent by design. Because there is no module system, there is no need for a `standalone` flag.

---

## Status

```txt
Ariana 0.4.1
Status: Official early release
NPM scope: @ariana-framework
Release line: core runtime, compiler diagnostics, router, forms, query, rendering, Vite plugin
```

Ariana is still a young framework and should be evaluated carefully before production use. The current release line focuses on package structure, release safety, compiler direction, unit tests, benchmarks, and a stable npm publishing path.

---

## Packages

```txt
@ariana-framework/core          core runtime, signals, DI, component metadata
@ariana-framework/compiler      template AST parser and diagnostics
@ariana-framework/router        typed router with guards, data, providers, nested routes
@ariana-framework/forms         signal-based forms and validation
@ariana-framework/query         query/cache client
@ariana-framework/rendering     SSR shell, SSG helpers, island utilities
@ariana-framework/vite-plugin   resource transform and template diagnostics integration
```

---

## Install

```bash
npm install @ariana-framework/core
```

Optional packages:

```bash
npm install @ariana-framework/router @ariana-framework/forms @ariana-framework/query @ariana-framework/rendering @ariana-framework/vite-plugin
```

---

## Example component

```ts
import { Component, Route, computed, signal } from '@ariana-framework/core';

@Route('/counter')
@Component({
  selector: 'ari-counter-page',
  templateUrl: './counter.page.html',
  styleUrl: './counter.page.css'
})
export class CounterPage {
  readonly count = signal(0);
  readonly step = signal(1);
  readonly double = computed(() => this.count() * 2);

  increment() {
    this.count.update(value => value + this.step());
  }
}
```

---

## Repository structure

```txt
packages/core          core runtime, reactivity, DI, component metadata
packages/compiler      template AST parser and diagnostics
packages/router        routing package
packages/forms         forms package
packages/query         query/cache package
packages/rendering     rendering and island helpers
packages/vite-plugin   Vite integration
examples/counter-app   demo application
benchmarks/            benchmark suites
docs/                  release, architecture, roadmap, and production notes
```

---

## Run locally

```bash
npm install
npm run build
npm test
npm run pack:npm
```

Counter example:

```bash
npm run demo:counter
```

---

## Release gates

Ariana releases are guarded by:

- full package build
- unit tests
- npm tarball generation
- tarball count and name validation
- guarded npm publish workflow

The source workspace can use internal package names while `pack:npm` stages official npm packages under `@ariana-framework/*`.

---

## Performance philosophy

Ariana should not claim to be faster than every framework in every scenario. The practical target is lower framework overhead for fine-grained UI updates, form-heavy screens, single-row updates, and signal-bound text or attribute updates.

Benchmark reports are available in `docs/`.

---

## License

MIT

# Ariana Framework

**Ariana** is a TypeScript-first, class-based frontend framework experiment for building large, structured UI applications with predictable performance.

Ariana is currently an **AI-built framework prototype**. The repository is being designed, documented, and implemented through an AI engineering workflow led by **ChatGPT, GPT-5.5 Thinking**, acting as an AI software engineering assistant under human direction.

This is intentionally stated in the README because transparency matters. The code, architecture notes, roadmap, and technical decisions are produced through AI-assisted engineering and must be reviewed, tested, benchmarked, and hardened before production use.

> Ariana v1 is an alpha prototype. It proves the component model, reactivity model, rendering direction, and project structure. It is not production-ready yet.

---

## AI authorship

This repository is fully AI-assisted at this stage.

```txt
AI assistant: ChatGPT
Model identity: GPT-5.5 Thinking
Role: AI software engineering assistant
Responsibilities: architecture, documentation, v1 prototype implementation, roadmap planning, benchmark planning
```

The AI assistant reviewed the trade-offs of Angular, React, Vue, Svelte, Solid, Qwik, Astro, Next/Nuxt-style rendering, and Blazor/Razor-style ergonomics. The conclusion was to start Ariana with a narrow and testable direction:

```txt
Angular-like class structure
+ Solid-like signal reactivity
+ Svelte-like compiler direction
+ external HTML/CSS by default
- NgModule
- standalone flag
- Zone.js
- Virtual DOM
- global change detection
```

Detailed AI engineering notes are available in [docs/AI_ENGINEERING.md](docs/AI_ENGINEERING.md).

---

## What Ariana is trying to prove

Ariana v1 tries to prove that a framework can keep the disciplined, class-based developer experience that many Angular developers like, while removing historical pieces that are not needed in a new framework:

- no `NgModule`
- no `standalone: true`
- no Zone.js
- no global change detection
- no Virtual DOM
- no forced single-file component format
- no implicit module/standalone complexity

In Ariana, every component is independent by design. Because there is no module system, there is no need for a `standalone` flag.

---

## Current status

```txt
Ariana v1 alpha

Status:
  Experimental / prototype

Main goal:
  Prove a class-based, signal-driven component runtime with external HTML/CSS.
```

Implemented in this repository:

- `signal()`
- `computed()`
- `effect()`
- `@Component()`
- `@Route()` metadata
- `bootstrap()`
- basic dependency injection with `inject()`
- external `templateUrl` / `styleUrl`
- Vite plugin for converting external templates/styles into raw imports
- basic interpolation: `{{ count() }}`
- event binding: `(click)="increment()"`
- property binding: `[value]="step()"`
- class binding: `[class.high]="count() >= 10"`
- basic `@if`
- basic `@for`
- basic child component mounting
- counter demo app

---

## Example component

```ts
import { Component, Route, computed, signal } from '@ariana/core';

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
  readonly status = computed(() => this.count() >= 10 ? 'High' : 'Normal');

  increment() {
    this.count.update(value => value + this.step());
  }

  decrement() {
    this.count.update(value => value - this.step());
  }
}
```

```html
<section class="counter-page">
  <h1>Ariana Counter</h1>

  <p>Count: {{ count() }}</p>
  <p>Double: {{ double() }}</p>
  <p [class.high]="count() >= 10">Status: {{ status() }}</p>

  <button (click)="decrement()">-</button>
  <button (click)="increment()">+</button>

  @if (showDetails()) {
    <p>This block is rendered only when showDetails is true.</p>
  }
</section>
```

---

## Repository structure

```txt
packages/
  core/
    src/
      reactivity/       signal, computed, effect
      component/        Component, Route, bootstrap
      di/               Injector, inject, providers
      template/         alpha runtime template renderer

  vite-plugin/
    src/                templateUrl/styleUrl transform

examples/
  counter-app/          Ariana v1 demo app

docs/
  ARCHITECTURE.md
  GETTING_STARTED.md
  ROADMAP.md
  DECISIONS.md
  BENCHMARK_PLAN.md
  AI_ENGINEERING.md
```

---

## Run locally

Requirements:

- Node.js 20+
- npm 10+

```bash
npm install
npm run build
npm run demo:counter
```

---

## Roadmap summary

### v1 — Core runtime alpha

Goal: prove the heart of Ariana.

- class-based component model
- external HTML/CSS
- signal/computed/effect
- bootstrap
- simple DI
- basic template binding
- basic control flow
- Vite plugin
- counter demo

### v2 — Compiler and performance baseline

Goal: replace the runtime template parser with a compile-time renderer.

- real template compiler
- direct DOM instruction generation
- production-safe expression handling
- template diagnostics
- first React benchmark suite
- performance budget rules

### v3 — Enterprise application layer

Goal: make Ariana usable for real admin/dashboard applications.

- typed router
- route guards
- route-level providers
- typed forms
- HTTP/query layer
- feature structure generator
- architecture rules

### v4 — Rendering modes and advanced delivery

Goal: support public apps and large-scale delivery.

- SSR
- SSG
- island-style partial interactivity
- hydration/resume experiments
- chunk analyzer
- production devtools

Full roadmap: [docs/ROADMAP.md](docs/ROADMAP.md)

---

## Performance philosophy

Ariana should not claim to be faster than React in every possible scenario before proper benchmarks exist.

The actual target is more precise:

> Ariana should have less framework overhead than React for fine-grained UI updates, form-heavy screens, single-row updates, and signal-bound text/attribute updates.

The current v1 renderer is a runtime prototype. Real React comparisons should happen after v2 introduces the production compiler.

Benchmark plan: [docs/BENCHMARK_PLAN.md](docs/BENCHMARK_PLAN.md)

---

## Important technical decisions

- all components are independent by design
- no `standalone: true`
- no module system in v1
- class components are the primary API
- `inject()` is preferred over constructor reflection
- external HTML/CSS is the default
- signals are the core state primitive
- the v1 renderer is temporary and will be replaced by a compiler

More: [docs/DECISIONS.md](docs/DECISIONS.md)

---

## Human review required

Ariana is being built by AI and must be reviewed as such. Before production use, the project needs human code review, benchmark validation, API design review, test coverage, and package publishing review.

---

## License

License is not selected yet.

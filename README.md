# Ariana Framework

**Ariana** is a TypeScript-first, class-based frontend framework experiment for building large, structured UI applications with predictable performance.

Ariana is currently an **AI-built framework prototype**. The repository is being designed, documented, and implemented through an AI engineering workflow led by **ChatGPT, GPT-5.5 Thinking**, acting as an AI software engineering assistant under human direction.

> Ariana is experimental. It is not production-ready. Human review, tests, security review, and benchmark validation are required before real use.

---

## AI authorship

```txt
AI assistant: ChatGPT
Model identity: GPT-5.5 Thinking
Role: AI software engineering assistant
Responsibilities: architecture, documentation, prototype implementation, roadmap planning, benchmark planning
```

The AI assistant reviewed ideas from Angular, React, Vue, Svelte, Solid, Qwik, Astro, Next/Nuxt-style rendering, and Blazor/Razor-style ergonomics.

The selected direction is:

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

More: [docs/AI_ENGINEERING.md](docs/AI_ENGINEERING.md)

---

## What Ariana is trying to prove

Ariana keeps the disciplined, class-based developer experience many Angular developers like, while removing historical pieces that are not needed in a new framework:

- no `NgModule`
- no `standalone: true`
- no Zone.js
- no global change detection
- no Virtual DOM
- external HTML/CSS by default

In Ariana, every component is independent by design. Because there is no module system, there is no need for a `standalone` flag.

---

## Current status

```txt
Ariana v2 compiler preview
Status: Experimental / prototype
Main goal: class components + signals + external HTML/CSS + limited compiler-generated render functions
```

Implemented now:

- `signal()`
- `computed()`
- `effect()`
- `@Component()`
- `@Route()` metadata
- `bootstrap()`
- basic dependency injection with `inject()`
- external `templateUrl` / `styleUrl`
- Vite plugin compiler preview
- interpolation: `{{ count() }}`
- event binding: `(click)="increment()"`
- property binding: `[value]="step()"`
- class binding: `[class.high]="count() >= 10"`
- simple conditional blocks
- simple loop blocks
- runtime fallback for unsupported templates
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

  increment() {
    this.count.update(value => value + this.step());
  }
}
```

---

## Repository structure

```txt
packages/core          core runtime, reactivity, DI, component metadata, render paths
packages/vite-plugin   resource transform and compiler preview
examples/counter-app   demo application
benchmarks/micro-update small framework comparison benchmark
docs/                  architecture, roadmap, decisions, compiler notes, benchmark reports
```

---

## Run locally

```bash
npm install
npm run build
npm run demo:counter
npm run benchmark:micro
```

---

## Roadmap

### v1 — Core runtime alpha

- class-based component model
- signals
- bootstrap
- simple DI
- runtime template renderer
- Vite resource transform

### v2 — Compiler and performance baseline

- compiled-render runtime path
- limited Vite compiler preview
- simple conditional compiler support
- simple loop compiler support
- framework benchmark suite
- future keyed list reconciliation
- future safe expression compiler

### v3 — Enterprise application layer

- typed router
- guards
- route-level providers
- typed forms
- HTTP/query layer
- architecture rules

### v4 — Rendering modes and advanced delivery

- SSR
- SSG
- islands
- hydration/resume experiments
- chunk analyzer
- devtools

---

## Performance philosophy

Ariana should not claim to be faster than React in every scenario before proper benchmarks exist.

The practical target is lower framework overhead for fine-grained UI updates, form-heavy screens, single-row updates, and signal-bound text/attribute updates.

Benchmark reports are available in `docs/`.

---

## License

License is not selected yet.

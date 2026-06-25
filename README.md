# Ariana Framework

**Ariana** is a TypeScript-first, class-based frontend framework experiment focused on building large, structured UI applications with predictable performance.

Ariana starts from the parts we like in Angular — class components, clear metadata, dependency injection, external HTML/CSS, and enterprise structure — but removes the historical complexity we do not want:

- no `NgModule`
- no `standalone: true`
- no Zone.js
- no global change detection
- no Virtual DOM
- no implicit framework magic that creates unpredictable architecture

> Ariana v1 is an alpha prototype. It proves the component model, reactivity model, rendering direction, and project structure. It is not production-ready yet.

---

## فارسی

آریانا یک فریم‌ورک فرانت‌اند بر پایه TypeScript است که هدفش ساخت اپلیکیشن‌های بزرگ، منظم و سریع است.

ایده اصلی این است:

> ساختار تمیز و کلاس‌محور شبیه Angular، اما بدون ماژول، بدون `standalone`، بدون Zone.js، بدون Change Detection سراسری و بدون Virtual DOM.

در آریانا همه‌ی کامپوننت‌ها ذاتاً مستقل هستند، پس چیزی به اسم `standalone: true` نداریم. این مفهوم فقط در Angular به خاطر تاریخچه‌ی `NgModule` معنی دارد.

---

## Current status

```txt
Ariana v1 alpha

Status:
  Experimental / prototype

Main goal:
  Prove a fast, class-based, signal-driven component runtime.
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

## Why Ariana?

Modern frontend frameworks usually force one of these trade-offs:

| Framework style | Good part | Problem Ariana tries to avoid |
|---|---|---|
| Angular | Structure, DI, enterprise discipline | NgModule history, Zone.js, heavy mental model |
| React | Composition, ecosystem | component rerender cost, external-library sprawl |
| Vue | Readability | less strict enterprise architecture by default |
| Svelte | compiler output | different syntax and less Angular-like enterprise feel |
| Solid | fine-grained reactivity | smaller ecosystem and less opinionated structure |
| Qwik | resumability | very complex architecture for v1 |

Ariana v1 chooses this direction:

```txt
Angular-like class structure
+ Signal-based fine-grained updates
+ External HTML/CSS by default
+ Compiler-ready template design
- NgModule
- standalone flag
- Virtual DOM
- Zone.js
```

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
  ARCHITECTURE.md       technical architecture
  GETTING_STARTED.md    local setup
  ROADMAP.md            v1/v2/v3/v4 plan
  DECISIONS.md          core technical decisions
  BENCHMARK_PLAN.md     React comparison plan
```

---

## Run locally

Requirements:

- Node.js 20+
- npm 10+

Install:

```bash
npm install
```

Build all packages and the example:

```bash
npm run build
```

Run the counter demo:

```bash
npm run demo:counter
```

Clean build output:

```bash
npm run clean
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
- no `new Function` in production output
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

## License

License is not selected yet.

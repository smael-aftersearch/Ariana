# Ariana Roadmap

This roadmap is intentionally staged. Ariana should not try to become Angular, Solid, Svelte, Qwik, Next, and Astro at the same time in v1.

The right path is:

```txt
v1: prove the core
v2: compile and benchmark
v3: add enterprise application features
v4: add rendering modes and advanced delivery
```

---

## v1 — Core runtime alpha

### Goal

Prove that Ariana's class-based component model can work with signal-based DOM updates and external HTML/CSS.

### Included

- `signal()`
- `computed()`
- `effect()`
- `@Component()`
- `@Route()` metadata
- `bootstrap()`
- simple DI with `inject()`
- `templateUrl` / `styleUrl`
- Vite plugin
- text interpolation
- event binding
- property binding
- class binding
- basic `@if`
- basic `@for`
- basic child component mounting
- counter demo

### Not included

- production compiler
- router runtime
- forms
- SSR
- resumability
- devtools
- final React benchmarks

### Success criteria

A developer can write this:

```ts
@Component({
  selector: 'ari-counter-page',
  templateUrl: './counter.page.html',
  styleUrl: './counter.page.css'
})
export class CounterPage {
  readonly count = signal(0);

  increment() {
    this.count.update(x => x + 1);
  }
}
```

and Ariana renders it and updates signal-bound DOM nodes.

---

## v2 — Compiler and performance baseline

### Goal

Move from an alpha runtime renderer to a compile-time renderer.

### Planned features

- template parser
- template AST
- compiler-generated DOM instructions
- static analysis of bindings
- production-safe expression compilation
- no runtime template interpretation in production
- no `new Function` in production renderer
- better `@if` and `@for`
- keyed list reconciliation
- child component compiler support
- source-map friendly diagnostics
- benchmark suite against React

### Success criteria

Ariana compiles this:

```html
<p>Count: {{ count() }}</p>
<button (click)="increment()">+</button>
```

into direct DOM instructions similar to:

```ts
const p = document.createElement('p');
const text = document.createTextNode('');
effect(() => text.nodeValue = String(ctx.count()));
```

### Performance tests

- counter updates
- 1,000 text bindings
- 10,000 row initial render
- single-row update
- keyed row swap
- form typing
- memory allocation

---

## v3 — Enterprise application layer

### Goal

Make Ariana practical for real dashboards, admin panels, identity screens, and form-heavy applications.

### Planned features

- typed router
- route guards
- route params
- route-level providers
- lazy route loading
- route chunk metadata
- typed forms
- validators
- async validators
- HTTP client
- query/cache/mutation layer
- feature generator
- architecture rules

### Example route direction

```ts
route('/users/:id', {
  component: () => import('./pages/user-details.page'),
  params: {
    id: numberParam()
  },
  canActivate: [authenticated()],
  providers: [UsersStore]
});
```

### Success criteria

Ariana can be used to build a realistic admin module with:

- route
- page
- child components
- store
- API class
- form
- validation
- basic auth guard

---

## v4 — Rendering modes and advanced delivery

### Goal

Make Ariana suitable for public applications, documentation sites, landing pages, and high-performance delivery.

### Planned features

- SSR
- SSG
- per-route render mode
- island-style partial interactivity
- hydration experiments
- resumability research
- chunk analyzer
- devtools
- performance budgets

### Important note

Resumability is not a v1 feature. It affects compiler, state serialization, event handlers, DI scopes, and chunk delivery. Ariana should be designed so resumability is possible later, but it should not be forced into the first implementation.

---

## Future candidates

- `.ari` single-file component format, optional only
- language server
- template type-checking
- official UI primitives
- animation package
- i18n/RTL package
- testing utilities
- migration experiments from Angular-like code

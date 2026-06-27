# Ariana Framework

**Ariana** is a TypeScript-first, class-based frontend framework for building structured UI applications with signal-based reactivity, compiler-assisted templates, explicit rendering paths, and small focused packages.

Ariana keeps the disciplined class-based developer experience many Angular developers like, while removing framework layers that are not needed in a new runtime:

- no `NgModule`
- no `standalone: true`
- no Zone.js
- no global dirty checking
- no Virtual DOM
- external HTML/CSS by default

In Ariana, every component is independent by design. Because there is no module system, there is no need for a `standalone` flag.

---

## Status

```txt
Ariana 1.0.0
Status: Version 1 release candidate / publish-ready after release gates
NPM scope: @ariana-framework
Release line: core runtime, compiler, router, forms, query, rendering, Vite plugin
```

Ariana 1.0 focuses on a stable foundation: package structure, release safety, compiler diagnostics, template type checking, runtime cleanup, forms, router, query state, rendering helpers, unit tests, smoke tests, benchmarks, and a GitHub Actions publishing path.

---

## Documentation

Start here:

- [Ariana 1.0 Guide](docs/ARIANA_V1_GUIDE.md)
- [Documentation Index](docs/INDEX.md)
- [GitHub Actions publish guide](docs/GITHUB_PUBLISH_V1.md)

The static documentation landing page lives in:

```txt
site/index.html
```

It is deployed by the GitHub Pages workflow:

```txt
.github/workflows/pages.yml
```

---

## Packages

```txt
@ariana-framework/core          components, bootstrap, signals, effects, DI, lifecycle cleanup
@ariana-framework/compiler      template parser, diagnostics, formatter, template type checking
@ariana-framework/router        route matching, params, guards, data, providers, lazy routes
@ariana-framework/forms         signal-based controls, groups, arrays, validators, async validators
@ariana-framework/query         query cache, stale state, retry, dedupe, invalidation, mutations
@ariana-framework/rendering     SSR shell helpers, static pages, island manifests, placeholders
@ariana-framework/vite-plugin   templateUrl/styleUrl transform, compilation, diagnostics, typecheck wiring
```

---

## Install

```bash
npm install @ariana-framework/core
```

Optional packages:

```bash
npm install @ariana-framework/router @ariana-framework/forms @ariana-framework/query
npm install @ariana-framework/rendering @ariana-framework/compiler
npm install -D @ariana-framework/vite-plugin
```

---

## Quick start

### 1. Bootstrap an app

```ts
import { bootstrap } from '@ariana-framework/core';
import { AppComponent } from './app.component.js';

bootstrap(AppComponent, '#app');
```

### 2. Create a component

```ts
import { Component, computed, signal } from '@ariana-framework/core';

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

### 3. Write the template

```html
<section class="counter-page">
  <h1>Count: {{ count() }}</h1>
  <p>Double: {{ double() }}</p>
  <button (click)="increment()">Increment</button>
</section>
```

### 4. Configure Vite

```ts
import { defineConfig } from 'vite';
import { ariana } from '@ariana-framework/vite-plugin';

export default defineConfig({
  plugins: [
    ariana({
      compileTemplates: true,
      strictTemplates: true,
      typeCheckTemplates: true
    })
  ]
});
```

---

## Template features

Ariana templates support:

- interpolation: `{{ title }}`
- property binding: `[value]="name()"`
- class binding: `[class.active]="selected()"`
- event binding: `(click)="save()"`
- conditionals: `@if (condition()) { ... }`
- loops: `@for (item of items(); track item.id) { ... }`
- `$event` in event bindings
- `$index` inside `@for`
- diagnostics with line and column output
- optional template type checking through the Vite plugin

See [Ariana 1.0 Guide](docs/ARIANA_V1_GUIDE.md) for full examples.

---

## Forms

Ariana forms are signal-based. Controls expose `value`, `valid`, `errors`, `pending`, `dirty`, and `touched` state.

```ts
import { formControl, formGroup, required } from '@ariana-framework/forms';

const profile = formGroup({
  firstName: formControl('', [required()]),
  lastName: formControl('', [required()])
});

profile.patchValue({ firstName: 'Ariana' });
console.log(profile.valid());
```

Forms include:

- `formControl`
- `formGroup`
- `formArray`
- sync validators
- async validators
- reset, patch, dirty, touched, pending, and error state

---

## Router

```ts
import { createRouter } from '@ariana-framework/router';

const router = createRouter([
  { path: '/', component: HomePage, title: 'Home' },
  { path: '/users/:id', component: UserPage, title: 'User' }
]);

const match = router.match('/users/42');
```

Router features include params, nested routes, route data, route providers, guards, redirect guards, and lazy route helpers.

---

## Query state

```ts
import { createQueryClient } from '@ariana-framework/query';

const queryClient = createQueryClient();
const user = await queryClient.fetch('user:42', loadUser, {
  staleTime: 30000,
  retry: 2
});
```

Query features include cache state, stale time, fetch deduplication, retry, exact invalidation, prefix invalidation, and mutations.

---

## Rendering

`@ariana-framework/rendering` provides helpers for:

- HTML shell output
- static route page generation
- route path to file path mapping
- island manifest and placeholder generation

---

## Repository structure

```txt
packages/core          core runtime, reactivity, DI, component metadata
packages/compiler      template AST parser, diagnostics, template type checking
packages/router        routing package
packages/forms         forms package
packages/query         query/cache package
packages/rendering     rendering and island helpers
packages/vite-plugin   Vite integration
examples/counter-app   demo application
examples/todo-app      typed package integration fixture
examples/vite-fixture  Vite integration fixture
benchmarks/            benchmark suites
docs/                  release, architecture, package, and usage docs
site/                  GitHub Pages documentation landing page
```

---

## Run locally

```bash
npm install
npm run build
npm test
```

Counter example:

```bash
npm run demo:counter
```

Full release gate:

```bash
npm run release:gates:v1
```

Dry-run publish:

```bash
npm run publish:v1:dry
```

Real publish is handled by GitHub Actions, not from a local machine.

---

## Release gates

Ariana 1.0 releases are guarded by:

- full package build
- unit tests
- stable API docs check
- runtime lifecycle docs check
- compiler diagnostics registry check
- template typecheck docs check
- template diagnostics fixture check
- Vite plugin docs check
- runtime lifecycle smoke test
- Vite plugin options smoke test
- benchmark smoke test
- candidate tarball packing
- tarball inspection
- guarded GitHub Actions npm publish workflow

---

## Performance philosophy

Ariana should not claim to be faster than every framework in every scenario. The practical target is lower framework overhead for fine-grained UI updates, form-heavy screens, single-row updates, and signal-bound text or attribute updates.

---

## License

MIT

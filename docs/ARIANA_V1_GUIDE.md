# Ariana Framework 1.0 Guide

Ariana is a TypeScript-first, class-based frontend framework for building structured UI applications with signal reactivity, compiler-assisted templates, explicit lifecycle cleanup, optional routing, forms, query state, rendering helpers, and Vite integration.

Ariana keeps the class-based developer experience while removing framework layers that are not needed in a new runtime: no `NgModule`, no `standalone` flag, no Zone.js, no global dirty checking, and no Virtual DOM.

## 1. Install

```bash
npm install @ariana-framework/core
```

Optional packages:

```bash
npm install @ariana-framework/router @ariana-framework/forms @ariana-framework/query
npm install @ariana-framework/rendering @ariana-framework/compiler
npm install -D @ariana-framework/vite-plugin
```

## 2. Packages

| Package | What it provides |
| --- | --- |
| `@ariana-framework/core` | Components, bootstrap, signals, computed state, effects, cleanup scopes, DI. |
| `@ariana-framework/compiler` | Template parser, diagnostics, formatter, source locations, type checking. |
| `@ariana-framework/router` | Routes, params, route data, guards, providers, nested and lazy routes. |
| `@ariana-framework/forms` | Signal-based controls, groups, arrays, sync validators, async validators. |
| `@ariana-framework/query` | Query cache, fetch state, stale time, retry, invalidation, mutations. |
| `@ariana-framework/rendering` | SSR shell helpers, static pages, island manifest and placeholders. |
| `@ariana-framework/vite-plugin` | `templateUrl`, `styleUrl`, template compilation, diagnostics, typecheck wiring. |

## 3. Suggested app structure

```txt
src/
  main.ts
  app.component.ts
  app.component.html
  app.component.css
  routes.ts
  features/
    counter/
      counter.page.ts
      counter.page.html
      counter.page.css
```

Ariana encourages external template and style files. This keeps TypeScript focused on state and behavior while HTML and CSS stay readable.

## 4. Bootstrap

```ts
import { bootstrap } from '@ariana-framework/core';
import { AppComponent } from './app.component.js';

bootstrap(AppComponent, '#app');
```

`index.html`:

```html
<div id="app"></div>
<script type="module" src="/src/main.ts"></script>
```

## 5. Component model

```ts
import { Component, computed, signal } from '@ariana-framework/core';

@Component({
  selector: 'ari-counter',
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

Rules:

- Components are independent by default.
- There is no module declaration layer.
- There is no `standalone: true` because Ariana components are standalone by design.
- Template members should exist on the class when template type checking is enabled.

## 6. Template setup

Recommended setup:

```ts
@Component({
  selector: 'ari-user-card',
  templateUrl: './user-card.html',
  styleUrl: './user-card.css'
})
export class UserCard {}
```

The Vite plugin reads `templateUrl` and `styleUrl` and turns them into runtime metadata. It can also compile supported templates into render functions.

Inline templates are possible for tiny components:

```ts
@Component({ selector: 'ari-badge', template: '<span>{{ label }}</span>' })
export class Badge { label = 'Ready'; }
```

## 7. Template syntax

Interpolation:

```html
<h1>{{ title }}</h1>
<p>Total: {{ total() }}</p>
```

Property binding:

```html
<input [value]="name()" />
<button [disabled]="saving()">Save</button>
```

Class binding:

```html
<div [class.active]="selected()">Item</div>
```

Event binding:

```html
<button (click)="save()">Save</button>
<input (input)="updateName($event.target.value)" />
```

Conditional rendering:

```html
@if (isLoggedIn()) {
  <p>Welcome back.</p>
}
```

Loop rendering:

```html
@for (item of items(); track item.id) {
  <article>{{ item.title }}</article>
}
```

## 8. Styling

Use `styleUrl` for component-local CSS:

```ts
@Component({
  selector: 'ari-panel',
  templateUrl: './panel.html',
  styleUrl: './panel.css'
})
export class Panel {}
```

Prefer a root class for predictable styling:

```html
<section class="panel">{{ title }}</section>
```

```css
.panel {
  display: grid;
  gap: 16px;
  padding: 24px;
}
```

## 9. Signals and computed state

```ts
import { signal, computed } from '@ariana-framework/core';

const count = signal(0);
const double = computed(() => count() * 2);

count.set(1);
count.update(value => value + 1);
```

Templates read signals by calling them:

```html
<p>{{ count() }}</p>
<p>{{ double() }}</p>
```

## 10. Effects and lifecycle cleanup

```ts
import { effect, signal } from '@ariana-framework/core';

const count = signal(0);
const stop = effect(() => {
  console.log(count());
});

stop();
```

Effects can return cleanup callbacks. Ariana also uses cleanup scopes so parent and child rendering cleanup stay connected.

## 11. Dependency injection

```ts
import { createInjector, createToken } from '@ariana-framework/core';

const API_URL = createToken<string>('API_URL');
const injector = createInjector([
  { token: API_URL, useValue: 'https://example.com/api' }
]);

const apiUrl = injector.get(API_URL);
```

Use DI for shared services, configuration, adapters, and testable dependencies.

## 12. Routing

```ts
import { createRouter } from '@ariana-framework/router';

const router = createRouter([
  { path: '/', component: HomePage, title: 'Home' },
  { path: '/users/:id', component: UserPage, title: 'User' }
]);

const match = router.match('/users/42');
```

Guards can allow, block, or redirect:

```ts
const authGuard = () => isLoggedIn() ? true : '/login';
```

Routes can also define data and providers.

## 13. Forms

Ariana forms are signal-based.

```ts
import { formControl, formGroup, required, minLength } from '@ariana-framework/forms';

const profile = formGroup({
  firstName: formControl('', [required(), minLength(2)]),
  lastName: formControl('', [required()])
});

profile.patchValue({ firstName: 'Ariana' });
console.log(profile.value());
console.log(profile.valid());
```

Form controls expose:

- `value`
- `touched`
- `dirty`
- `pending`
- `errors`
- `asyncErrors`
- `valid`
- `setValue`
- `patchValue`
- `markTouched`
- `validateAsync`
- `reset`

Form arrays are useful for repeated controls:

```ts
import { formArray, formControl } from '@ariana-framework/forms';

const tags = formArray([formControl('framework')]);
tags.push(formControl('signals'));
```

## 14. Query and mutation state

```ts
import { createQueryClient } from '@ariana-framework/query';

const queryClient = createQueryClient();
const user = await queryClient.fetch('user:42', loadUser, {
  staleTime: 30000,
  retry: 2
});
```

The query client supports cache reads, writes, stale checks, invalidation, deduped fetches, retry, and clear.

```ts
queryClient.invalidate('user:42');
queryClient.invalidateMatching('user');
```

Use mutations for write actions and invalidate queries after successful writes.

## 15. Rendering, SSG, and islands

`@ariana-framework/rendering` provides explicit rendering helpers for:

- HTML shell output.
- Static route page generation.
- Route path to file path mapping.
- Island manifest and placeholder generation.

Use this package when you need SSR-like output, static pages, or island-style hydration boundaries.

## 16. Vite plugin

```ts
import { defineConfig } from 'vite';
import { ariana } from '@ariana-framework/vite-plugin';

export default defineConfig({
  plugins: [
    ariana({
      compileTemplates: true,
      strictTemplates: true,
      typeCheckTemplates: true,
      strictWarnings: false
    })
  ]
});
```

Options:

| Option | Purpose |
| --- | --- |
| `include` | Select files to transform. |
| `compileTemplates` | Compile supported templates. |
| `strictTemplates` | Throw on template errors. |
| `strictWarnings` | Treat warnings as blocking diagnostics. |
| `typeCheckTemplates` | Check template members and typed symbols. |
| `templateTypeCheckMembers` | Add explicit members. |
| `templateTypeCheckSymbols` | Add typed members for object and method checks. |

## 17. Compiler diagnostics

Diagnostics are designed for readable terminal and CI output:

```txt
cmp.html:1:4 ERROR ARI_TYPE_UNKNOWN_MEMBER: Unknown template member: title
<p>{{ title }}</p>
   ^
```

Diagnostics include a code, level, message, source index, and source location.

## 18. Template type checking

Template type checking verifies component members, object properties, callability, method argument count, `$event`, and `$index`.

Example component:

```ts
export class ProfilePage {
  title = 'Profile';
  user: { name: string } = { name: 'Ariana' };
  save(event?: Event) {}
}
```

Valid template:

```html
<h1>{{ title }}</h1>
<p>{{ user.name }}</p>
<button (click)="save($event)">Save</button>
```

Invalid access can produce diagnostics such as `ARI_TYPE_UNKNOWN_PROPERTY`.

## 19. Release gates

Run the full v1 gate:

```bash
npm run release:gates:v1
```

It covers build, unit tests, docs checks, compiler diagnostics, template fixtures, runtime smoke, Vite option smoke, benchmark smoke, package packing, and tarball inspection.

Dry-run publish:

```bash
npm run publish:v1:dry
```

Real publish should run from GitHub Actions.

## 20. Documentation site

The static documentation landing page lives in:

```txt
site/index.html
```

The GitHub Pages workflow publishes the `site` folder.

## 21. Troubleshooting

### `templateUrl` does not work

Check that the Vite plugin is installed and enabled.

### Unknown template member

Add the member to the component class or provide explicit typecheck members.

### Form async validation stays pending

Ensure validators return resolved promises and that `validateAsync()` is awaited.

### Publish requires login

Dry-run may warn about login. Real publish should use GitHub Actions and a repository secret.

## 22. What Ariana 1.0 focuses on

- Class-based components.
- Signal reactivity.
- External templates and styles.
- Compiler-assisted templates.
- Strict diagnostics.
- Signal-based forms.
- Router guards and route data.
- Query state and invalidation.
- Explicit cleanup lifecycle.
- Safe release and publish gates.

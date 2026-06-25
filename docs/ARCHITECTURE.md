# Ariana v1 Architecture

Ariana v1 is a small alpha runtime that proves the first architectural direction of the framework.

---

## Core principles

1. No `NgModule`.
2. No `standalone: true`.
3. No Zone.js.
4. No Virtual DOM.
5. No global change detection.
6. Class-based components first.
7. External HTML/CSS by default.
8. Signals are the core reactive primitive.
9. The production target is compile-time DOM instructions.

---

## Package layout

```txt
packages/core
  reactivity
  component
  di
  template

packages/vite-plugin
  templateUrl/styleUrl transform
```

---

## Reactivity

The v1 reactivity package provides:

```ts
signal<T>(initialValue)
computed<T>(() => value)
effect(() => { ... })
```

The desired update model is:

```txt
signal changes
  -> dependent computation runs
  -> exact binding updates
```

---

## Component model

Ariana components are TypeScript classes with metadata:

```ts
@Component({
  selector: 'ari-users-page',
  templateUrl: './users.page.html',
  styleUrl: './users.page.css',
  components: [],
  providers: []
})
export class UsersPage {}
```

There is intentionally no `standalone` flag.

---

## Dependency injection

Ariana v1 includes a small injector:

```ts
private readonly store = inject(UsersStore);
```

Providers can be registered at bootstrap or component level:

```ts
bootstrap(AppComponent, '#app', {
  providers: [AppService]
});
```

```ts
@Component({
  providers: [UsersStore]
})
export class UsersPage {}
```

---

## Template renderer

Ariana v1 supports a temporary runtime template renderer.

Current features:

- `{{ expression }}`
- `(event)="statement"`
- `[property]="expression"`
- `[class.name]="expression"`
- `@if (...) { ... }`
- `@for (item of items(); track item.id) { ... }`
- simple child component mounting

This renderer is not the final production architecture.

---

## Compiler target

Ariana v2 should compile templates into direct DOM instructions.

Example target direction:

```ts
const p = document.createElement('p');
const text = document.createTextNode('');
p.append('Count: ', text);

effect(() => {
  text.nodeValue = String(ctx.count());
});
```

This is the path that can make Ariana faster than React in fine-grained UI updates.

---

## Vite plugin

The Vite plugin transforms this:

```ts
@Component({
  templateUrl: './counter.page.html',
  styleUrl: './counter.page.css'
})
```

into raw imports:

```ts
import __ari_template_0 from './counter.page.html?raw';
import __ari_style_0 from './counter.page.css?raw';

@Component({
  template: __ari_template_0,
  style: __ari_style_0
})
```

This lets developers keep separate HTML/CSS files while the runtime receives strings.

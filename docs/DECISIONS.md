# Ariana Technical Decisions

This document records the first architectural decisions for Ariana.

---

## 1. No `standalone: true`

Ariana does not have `standalone: true` because Ariana does not have `NgModule`.

In Angular, `standalone` exists because Angular historically used `NgModule`. Ariana starts module-free, so every component is independent by design.

```ts
// Not Ariana
@Component({
  standalone: true
})
export class Page {}
```

Correct Ariana style:

```ts
@Component({
  selector: 'ari-page',
  templateUrl: './page.html',
  styleUrl: './page.css'
})
export class Page {}
```

---

## 2. Class components first

Ariana's primary component API is class-based.

Reasons:

- familiar to Angular developers
- explicit properties and methods
- easier enterprise organization
- good fit for external templates
- stable mental model for large teams

---

## 3. External HTML/CSS by default

Ariana supports inline templates for small components later, but the default project style is:

```txt
user-card.component.ts
user-card.component.html
user-card.component.css
```

This keeps behavior, markup, and styling readable in large applications.

---

## 4. Signals are the core state primitive

Ariana uses signals for local state and derived state.

```ts
readonly count = signal(0);
readonly double = computed(() => this.count() * 2);
```

The rendering target is:

```txt
signal changes
  -> dependent binding updates
  -> exact DOM node changes
```

not:

```txt
state changes
  -> component rerenders
  -> virtual tree diff
  -> DOM patch
```

---

## 5. No Virtual DOM

Ariana should not build a virtual tree and diff it on every update.

The production compiler should generate direct DOM instructions and connect signal dependencies directly to text, attributes, classes, and child component inputs.

---

## 6. No Zone.js

Ariana should not use global async monkey-patching or global change detection.

Updates should happen through explicit reactive dependencies.

---

## 7. `inject()` over constructor reflection

Ariana prefers:

```ts
private readonly store = inject(UsersStore);
```

over runtime constructor reflection.

Reasons:

- easier static analysis
- simpler implementation
- no reflect-metadata requirement
- clearer dependencies
- better future compatibility with compiler/SSR/resumability

---

## 8. Runtime renderer is temporary

The v1 renderer is an alpha prototype. It uses runtime parsing to prove API shape.

The v2 compiler should replace it with compile-time output.

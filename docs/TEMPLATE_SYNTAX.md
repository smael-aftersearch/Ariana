# Ariana Template Syntax

This document defines the intended Ariana template syntax.

## Template source

Ariana prefers external templates by default:

```ts
@Component({
  selector: 'app-counter',
  templateUrl: './counter.html',
  styleUrl: './counter.css'
})
export class CounterPage {}
```

Inline templates may exist later, but they are not the primary authoring model.

## Text interpolation

```html
<p>Hello {{ name }}</p>
```

Rules:

- interpolation expressions read from the component instance
- interpolation should compile to direct text updates
- invalid interpolation must produce diagnostics

## Property binding

```html
<button [disabled]="isSaving()">Save</button>
```

Rules:

- property bindings update DOM properties
- expressions are evaluated against the component instance
- invalid target syntax must produce diagnostics

## Attribute binding

```html
<div [attr.aria-label]="label()"></div>
```

Rules:

- attribute bindings update DOM attributes
- `undefined` or `null` should remove the attribute

## Class binding

```html
<div [class.active]="isActive()"></div>
```

Rules:

- class binding toggles a single class
- class map syntax can be considered later

## Style binding

```html
<div [style.width.px]="width()"></div>
```

Rules:

- style binding updates a single style property
- unit suffix support should be explicit

## Event binding

```html
<button (click)="increment()">+</button>
```

Rules:

- events attach listeners directly
- listener cleanup must be tied to component destroy
- `$event` support should be defined explicitly before stable release

## Conditional block

```html
@if (visible()) {
  <section>Visible</section>
}
```

Rules:

- `@if` should compile to stable anchor-based DOM operations
- runtime template interpretation is not allowed in production mode

## List block

```html
@for (item of items(); track item.id) {
  <li>{{ item.name }}</li>
}
```

Rules:

- `track` is required for production list rendering
- list updates should be keyed and targeted
- uncontrolled full-list rerender is not the default strategy

## Unsupported syntax for now

- pipes
- two-way binding
- template refs
- content projection
- structural directive aliases
- dynamic component outlet

These may be added later only with compiler diagnostics and tests.

## Diagnostics policy

Invalid templates should fail in strict mode. Ariana should not silently fall back to runtime interpretation for production builds.

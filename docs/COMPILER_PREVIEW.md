# Ariana v2 Compiler Preview

Ariana now has a limited compiler path inside `@ariana/vite-plugin`.

This is not the final compiler. It is the current bridge from the v1 runtime template parser toward compiler-generated render functions.

---

## What changed

The Vite plugin no longer only converts external resources into raw imports. For supported templates, it reads the external HTML file during transform and generates a `render` function directly inside component metadata.

Before:

```ts
@Component({
  templateUrl: './counter.html',
  styleUrl: './counter.css'
})
```

Earlier v1 transform:

```ts
import template from './counter.html?raw';
import style from './counter.css?raw';

@Component({
  template,
  style
})
```

Current compiler-preview transform for supported templates:

```ts
@Component({
  render: function __ari_render(ctx, host) {
    // generated DOM update logic
  },
  style: '...'
})
```

`bootstrap()` detects `metadata.render` and uses the compiled-render path instead of the v1 runtime parser.

---

## Supported in this compiler preview

The current compiler preview supports templates with:

- text interpolation: `{{ count() }}`
- event binding: `(click)="increment()"`
- property binding: `[value]="step()"`
- class binding: `[class.high]="count() >= 10"`
- simple conditional blocks: `@if (show()) { ... }`
- simple loops: `@for (item of items(); track item.id) { ... }`
- nested bindings inside compiled `@if` and `@for` blocks
- access to loop locals such as `item` and `$index`
- external CSS through `styleUrl`

Example:

```html
<p>Count: {{ count() }}</p>
<button (click)="increment()">+</button>

@if (showDetails()) {
  <p>Double: {{ double() }}</p>
}

@for (user of users(); track user.id) {
  <button [class.active]="user.active" (click)="selectUser(user)">
    {{ $index }} - {{ user.name }}
  </button>
}
```

---

## Fallback behavior

The compiler intentionally falls back to the v1 runtime renderer when it sees unsupported or invalid syntax.

Currently unsupported in the compiler preview:

- `@else` / `@else if`
- keyed DOM retention for `@for`
- child component compilation
- advanced expression analysis
- template type-checking
- source mapped compiler diagnostics

This fallback is intentional. It lets Ariana move forward safely without breaking existing v1 templates.

---

## Current control-flow compiler limits

The current `@if` compiler supports truthy/falsy blocks and nested bindings.

The current `@for` compiler supports simple rerendering of the loop body. It accepts a `track` expression, but the generated code does not yet use it for keyed DOM reuse. Every list update currently clears and recreates the loop body.

This is acceptable for a compiler preview, but the real v2 compiler should implement keyed reconciliation.

---

## Why this matters

The v2 performance benchmark showed that Ariana can be very fast when the template path is compiled into direct render logic.

The next step is to grow this compiler until the manual compiled-preview path becomes fully generated from normal `.html` templates.

---

## Current engineering status

```txt
Ariana v1 runtime parser:
  stable enough for prototype templates

Ariana v2 compiled-render path:
  available in core runtime

Ariana v2 compiler preview:
  implemented in Vite plugin for simple templates, simple conditionals, and simple loops

Next:
  real template AST, safer expression compiler, keyed @for reconciliation, child component compiler
```

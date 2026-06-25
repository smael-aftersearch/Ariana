# Ariana v2 Compiler Preview

Ariana now has the first limited compiler path inside `@ariana/vite-plugin`.

This is not the final compiler. It is the first step from the v1 runtime template parser toward compiler-generated render functions.

---

## What changed

Before this preview, the Vite plugin only transformed this:

```ts
@Component({
  templateUrl: './counter.html',
  styleUrl: './counter.css'
})
```

into raw imports:

```ts
import template from './counter.html?raw';
import style from './counter.css?raw';

@Component({
  template,
  style
})
```

Now, for supported templates, the plugin reads the HTML file during transform and generates a `render` function:

```ts
@Component({
  render: function __ari_render(ctx, host) {
    // generated DOM update logic
  },
  style: '...'
})
```

`bootstrap()` already detects `metadata.render` and uses the compiled-render path instead of the v1 runtime parser.

---

## Supported in this compiler preview

The current compiler preview supports templates with:

- text interpolation: `{{ count() }}`
- event binding: `(click)="increment()"`
- property binding: `[value]="step()"`
- class binding: `[class.high]="count() >= 10"`
- simple conditional blocks: `@if (show()) { ... }`
- nested bindings inside compiled conditional blocks
- external CSS through `styleUrl`

Example:

```html
<p>Count: {{ count() }}</p>
<button (click)="increment()">+</button>
<input [value]="step()" />
<p [class.high]="count() >= 10">Status</p>

@if (showDetails()) {
  <p>Double: {{ double() }}</p>
}
```

---

## Fallback behavior

The compiler intentionally falls back to the v1 runtime renderer when it sees unsupported features.

Currently unsupported in the compiler preview:

- `@for`
- `@else` / `@else if`
- child component compilation
- advanced expression analysis
- template type-checking

This fallback is intentional. It lets Ariana move forward safely without breaking existing v1 templates.

---

## Current conditional compiler limits

The current `@if` compiler is intentionally simple. It supports basic truthy/falsy conditional blocks and nested text/event/property/class bindings inside the block.

It does not yet support `@else`, `@else if`, keyed retention, child component creation inside compiled branches, or template type-checking.

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
  implemented in Vite plugin for simple templates and simple conditional blocks

Next:
  real template AST, safer expression compiler, @for compiler, child component compiler
```

# Ariana v2 Compiler Preview

Ariana now has a limited compiler path inside `@ariana/vite-plugin`.

This is not the final compiler. It is the current bridge from the v1 runtime template parser toward compiler-generated render functions.

---

## What changed

The Vite plugin no longer only converts external resources into raw imports. For supported templates, it reads the external HTML file during transform and generates a `render` function directly inside component metadata.

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
- keyed loops: `@for (item of items(); track item.id) { ... }`
- fast row binding for simple loop bodies
- nested bindings inside compiled `@if` and `@for` blocks
- access to loop locals such as `item` and `$index`
- external CSS through `styleUrl`

Example:

```html
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

## Keyed `@for` behavior

Compiled `@for` uses the `track` expression.

The generated code keeps a `Map` of row records. Each record stores the stable key, DOM nodes, cleanup callbacks, the latest row item, the latest row index, and a generated `update()` function for simple row bodies.

When the list updates, Ariana reuses records with the same key, updates the item/index values, calls the row updater only when the item or index changed, moves DOM nodes only when order changes, and removes records whose keys disappeared.

For complex rows that contain nested control flow, Ariana falls back to the signal-based row strategy. This is still a preview implementation, but it no longer recreates the whole list on every update.

---

## Fallback behavior

The compiler intentionally falls back to the v1 runtime renderer when it sees unsupported or invalid syntax.

Currently unsupported in the compiler preview:

- `@else` / `@else if`
- child component compilation
- advanced expression analysis
- template type-checking
- source mapped compiler diagnostics

---

## Current limits

The current compiler is still string/regex-based. It should be replaced with a real template AST.

The keyed list implementation is correct enough for preview testing. Simple rows now use a direct row updater, while complex rows still use signal-based row bindings. The next bottleneck is list-level scheduling because the top-level list effect still scans the whole list on each update.

---

## Current engineering status

```txt
Ariana v1 runtime parser:
  stable enough for prototype templates

Ariana v2 compiled-render path:
  available in core runtime

Ariana v2 compiler preview:
  simple templates, simple conditionals, keyed loops, fast simple-row updates

Next:
  real template AST, safer expression compiler, list-level scheduling, child component compiler
```

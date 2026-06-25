# Ariana Performance Results - v4 batch - 2026-06-25

This report covers the batch that finishes the v3 enterprise preview and starts v4 rendering work.

## Batch contents

This batch includes:

- `@ariana/forms` typed signal forms preview
- `@ariana/query` query/cache preview
- improved `@ariana/router` route metadata and route-level provider collection
- improved `@ariana/compiler` AST parser preview with element, attribute, interpolation, `@if`, and `@for` nodes
- `@ariana/rendering` v4 preview for SSR/SSG/island manifest helpers
- forms, query, rendering, router, AST, and list operation benchmarks

## Build

```txt
npm run build
```

Build passed locally for:

```txt
packages/core
packages/compiler
packages/router
packages/forms
packages/query
packages/rendering
packages/vite-plugin
examples/counter-app
```

## List operation benchmark

| Operation | Strategy | Median avg cost |
|---|---|---:|
| update | Ariana @for + listSignal | 84.125 us/op |
| update | Vanilla keyed DOM | 92.366 us/op |
| update | Ariana @for + normal signal | 541.806 us/op |
| insert | Vanilla keyed DOM | 111.159 us/op |
| insert | Ariana @for + listSignal | 549.698 us/op |
| insert | Ariana @for + normal signal | 4,394.108 us/op |
| remove | Vanilla keyed DOM | 16.133 us/op |
| remove | Ariana @for + listSignal | 53.571 us/op |
| remove | Ariana @for + normal signal | 56,690.032 us/op |
| move | Vanilla keyed DOM | 105.357 us/op |
| move | Ariana @for + listSignal | 314.818 us/op |
| move | Ariana @for + normal signal | 31,945.509 us/op |

## Router benchmark

The router benchmark uses 250 route patterns and 20,000 matches.

```txt
Median route match cost: 6.094 us/match
Raw runs: 6.715, 5.894, 6.459, 6.094, 5.829
```

## Compiler AST benchmark

The AST parser now recognizes element, attribute, interpolation, `@if`, and `@for` nodes.

```txt
Median parse cost: 10.397 us/parse
Raw runs: 11.746, 10.397, 10.732, 10.367, 9.708
Iterations: 50,000
```

## Forms benchmark

The forms benchmark uses 200 controls and 5,000 updates.

| Strategy | Median cost |
|---|---:|
| Plain object field write | 0.377 us/update |
| Ariana formControl setValue + validation | 3.052 us/update |
| Ariana formGroup patchValue one control | 133.862 us/update |

## Query benchmark

The query benchmark uses 1,000 keys and 100,000 set/get operations.

| Strategy | Median cost |
|---|---:|
| Raw Map set/get | 0.166 us/op |
| Ariana QueryClient set/get | 0.619 us/op |

## Rendering benchmark

The rendering benchmark generates 1,000 static pages with island placeholders and island manifests.

```txt
Median static page generation cost: 8.055 us/page
Raw runs: 9.567, 8.055, 5.264, 7.922, 8.679
```

## Engineering conclusion

v3 is now complete enough to close the enterprise-preview phase:

- router exists
- forms exist
- query/cache exists
- compiler AST boundary exists
- performance reports exist

v4 has started with the rendering package:

- SSR shell rendering
- SSG page generation
- island manifest helpers

Next v4 work:

1. browser benchmark automation
2. hydration strategy
3. route-based SSG integration
4. island activation runtime
5. chunk analyzer

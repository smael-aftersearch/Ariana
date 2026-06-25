# Ariana Performance Results - release and npm packaging batch - 2026-06-25

This report covers the release-focused batch after the v4 rendering preview.

## Batch contents

This batch includes:

- npm-ready package metadata for all public Ariana packages
- aligned package versions at `0.4.0-alpha.0`
- package README files
- package tarball generation with `npm pack`
- release scripts for pack and publish
- repeated performance checks for list operations, router, compiler AST, forms, query, and rendering

## Build

```txt
npm run clean
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

This shorter release check used 120 rows, 10 iterations, 3 warmup operations, and 2 runs to avoid the very slow normal-signal remove path dominating release verification time.

| Operation | Strategy | Median avg cost |
|---|---|---:|
| update | Ariana @for + listSignal | 121.166 us/op |
| update | Vanilla keyed DOM | 353.464 us/op |
| update | Ariana @for + normal signal | 498.478 us/op |
| insert | Vanilla keyed DOM | 237.455 us/op |
| insert | Ariana @for + listSignal | 638.143 us/op |
| insert | Ariana @for + normal signal | 3,694.509 us/op |
| remove | Vanilla keyed DOM | 15.587 us/op |
| remove | Ariana @for + listSignal | 69.591 us/op |
| remove | Ariana @for + normal signal | 13,273.266 us/op |
| move | Vanilla keyed DOM | 86.327 us/op |
| move | Ariana @for + listSignal | 133.658 us/op |
| move | Ariana @for + normal signal | 5,656.248 us/op |

## Router benchmark

```txt
Routes: 250
Iterations: 20,000
Median route match cost: 6.112 us/match
Raw runs: 6.957, 5.967, 6.259, 6.011, 6.112
```

## Compiler AST benchmark

```txt
Iterations: 50,000
Median parse cost: 11.080 us/parse
Raw runs: 11.089, 11.536, 11.080, 10.087, 9.547
```

## Forms benchmark

```txt
Controls: 200
Iterations: 5,000
```

| Strategy | Median cost |
|---|---:|
| Plain object field write | 0.252 us/update |
| Ariana formControl setValue + validation | 2.991 us/update |
| Ariana formGroup patchValue one control | 136.882 us/update |

## Query benchmark

```txt
Keys: 1,000
Iterations: 100,000
```

| Strategy | Median cost |
|---|---:|
| Raw Map set/get | 0.162 us/op |
| Ariana QueryClient set/get | 0.665 us/op |

## Rendering benchmark

```txt
Routes: 1,000
Median static page generation cost: 8.025 us/page
Raw runs: 10.341, 8.025, 5.163, 9.250, 7.717
```

## NPM package tarballs

The following tarballs were generated locally with `npm pack`:

```txt
ariana-core-0.4.0-alpha.0.tgz
ariana-compiler-0.4.0-alpha.0.tgz
ariana-router-0.4.0-alpha.0.tgz
ariana-forms-0.4.0-alpha.0.tgz
ariana-query-0.4.0-alpha.0.tgz
ariana-rendering-0.4.0-alpha.0.tgz
ariana-vite-plugin-0.4.0-alpha.0.tgz
```

## NPM publish status

The package tarballs and publish script are ready, but actual npm publishing was not executed because this environment does not have `NPM_TOKEN` set and does not have confirmed ownership of the `@ariana` npm scope.

Publishing requires an authenticated npm account with access to the target package scope.

# Ariana Performance Results - v3 batch - 2026-06-25

This report covers the batch that closes the v2 list compiler direction and starts the v3 enterprise preview.

## Batch contents

This batch includes:

- cached row template creation for compiled `@for` rows
- targeted `listSignal.moveByKey()` runtime operation
- targeted compiled `@for` handling for update, insert, remove, move, and clear
- typed router preview in `@ariana/router`
- compiler AST preview in `@ariana/compiler`
- operation, router, and AST benchmarks

## Environment

```txt
Runtime: Node.js 22.16.0
DOM: jsdom 29.1.1 for list operation benchmark
Rows: 300
List operation iterations: 30
List operation warmup: 10
List operation runs: 3
Router routes: 250
Router iterations: 20,000
AST parse iterations: 50,000
```

## List operation benchmark

| Operation | Strategy | Median avg cost |
|---|---|---:|
| update | Ariana @for + listSignal | 77.213 us/op |
| update | Vanilla keyed DOM | 102.206 us/op |
| update | Ariana @for + normal signal | 660.007 us/op |
| insert | Vanilla keyed DOM | 135.467 us/op |
| insert | Ariana @for + listSignal | 464.758 us/op |
| insert | Ariana @for + normal signal | 4,321.683 us/op |
| remove | Vanilla keyed DOM | 16.028 us/op |
| remove | Ariana @for + listSignal | 52.299 us/op |
| remove | Ariana @for + normal signal | 55,481.885 us/op |
| move | Vanilla keyed DOM | 110.557 us/op |
| move | Ariana @for + listSignal | 187.863 us/op |
| move | Ariana @for + normal signal | 34,026.407 us/op |

## List operation interpretation

The listSignal-driven path is much faster than the normal signal path:

```txt
update: 660.007 -> 77.213 us/op
insert: 4,321.683 -> 464.758 us/op
remove: 55,481.885 -> 52.299 us/op
move: 34,026.407 -> 187.863 us/op
```

The biggest remaining gap is row creation for insert and DOM movement for move. Those are now explicit optimization targets rather than hidden full-sync problems.

## Router benchmark

The v3 typed router preview was tested with 250 route patterns and 20,000 route matches.

```txt
Median route match cost: 6.144 us/match
Raw runs: 6.817, 6.144, 6.318, 5.987, 5.518
```

The router precompiles route patterns once in `createRouter()` and reuses the compiled route table for subsequent matches.

## Compiler AST benchmark

The compiler AST preview was tested by parsing a small component template 50,000 times.

```txt
Median parse cost: 1.269 us/parse
Raw runs: 1.399, 1.238, 1.528, 1.269, 1.228
```

This AST parser is intentionally small. It is not the final compiler parser yet, but it establishes the package boundary and AST model for v3 compiler work.

## Engineering conclusion

The v2 list compiler direction is now complete enough to close the v2 preview phase:

- compiled conditionals exist
- compiled loops exist
- keyed DOM reuse exists
- listSignal targeted update/insert/remove/move exists
- normal signal fallback exists
- performance reports exist

The project can now move into v3 preview work:

- typed router
- route guards
- route metadata
- compiler AST package
- future forms and HTTP/query packages
- browser benchmark automation

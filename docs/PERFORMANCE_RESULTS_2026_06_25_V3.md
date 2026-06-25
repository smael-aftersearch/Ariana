# Ariana Performance Results — v2 compiler preview with simple loops — 2026-06-25

This document records the repeated micro-update benchmark after adding simple loop compiler support.

This benchmark is intentionally the same kind of small test used in previous reports: one mounted counter component, one text binding, and repeated count updates.

The new loop compiler does not directly change this tiny counter path, but the benchmark was repeated to make sure the latest compiler/runtime changes did not regress the core signal-bound update path.

---

## Environment

```txt
Runtime: Node.js 22.16.0
DOM environment: jsdom 29.1.1
Iterations per run: 5,000
Warmup updates per run: 500
Runs: 5
Scenario: one mounted counter component, one text binding, repeated count updates
```

Framework/package versions used in this quick test:

```txt
Ariana: v2 compiler preview local build
React: 19.2.7
Vue: 3.5.39
Solid: 1.9.13
Angular: 22.0.2
jsdom: 29.1.1
```

Angular 22.0.2 still emitted a Node engine warning in this local environment because this environment uses Node.js 22.16.0. The benchmark still executed successfully.

---

## Median results

Median average update cost across 5 runs:

| Rank | Framework | Median avg update cost |
|---:|---|---:|
| 1 | Ariana v2 compiled preview | 3.386 µs/update |
| 2 | Vanilla TextNode | 3.895 µs/update |
| 3 | Solid signal | 6.200 µs/update |
| 4 | Ariana v1 runtime | 7.630 µs/update |
| 5 | Angular signal + detectChanges | 15.509 µs/update |
| 6 | Vanilla DOM textContent | 25.253 µs/update |
| 7 | Vue nextTick | 60.755 µs/update |
| 8 | React flushSync | 194.025 µs/update |

---

## Raw run values

Values are average microseconds per update.

| Framework | Run values |
|---|---|
| Ariana v2 compiled preview | 4.073, 3.051, 3.386, 3.199, 3.437 |
| Vanilla TextNode | 3.854, 4.100, 3.895, 4.480, 3.881 |
| Solid signal | 6.200, 5.840, 6.107, 6.529, 6.702 |
| Ariana v1 runtime | 7.630, 7.652, 7.293, 8.467, 7.313 |
| Angular signal + detectChanges | 15.509, 15.374, 16.299, 13.097, 16.224 |
| Vanilla DOM textContent | 27.365, 25.224, 25.253, 26.280, 22.811 |
| Vue nextTick | 62.859, 60.501, 60.755, 59.734, 61.212 |
| React flushSync | 209.635, 194.520, 194.025, 185.694, 193.054 |

---

## Interpretation

The result is still encouraging:

```txt
Ariana v2 compiled preview remains faster than React, Vue, Angular, Solid, and Ariana v1 runtime in this jsdom microbenchmark.
Ariana v2 compiled preview remains close to direct TextNode updates.
No regression was observed in the core text-binding update path after adding simple loop compiler support.
```

Important: this is not a full app benchmark and it does not prove Ariana is globally faster than every framework. It only measures one tiny update path in jsdom.

---

## Engineering conclusion

The current v2 compiler direction is valid.

The compiler now supports:

- simple interpolation
- event binding
- property binding
- class binding
- simple conditional blocks
- simple loop blocks

The next required work is to replace the regex/string-based compiler with a real template AST and then implement keyed loop reconciliation.

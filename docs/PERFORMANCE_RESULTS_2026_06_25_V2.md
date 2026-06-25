# Ariana Performance Results — v2 compiled preview — 2026-06-25

This document records the second quick performance test for Ariana.

This run adds:

- an Ariana v2 compiled-render preview path
- Angular in the comparison set
- the same small counter text-binding update scenario as the first report

This is still not a final framework benchmark. The test runs in jsdom, not a real browser. It is a microbenchmark for one signal-bound text update.

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
Ariana: v2 compiled preview local build
React: 19.2.7
Vue: 3.5.39
Solid: 1.9.13
Angular: 22.0.2
jsdom: 29.1.1
```

Note: Angular 22.0.2 was installed by npm with a Node engine warning because this local environment uses Node.js 22.16.0 while the package declares a higher supported Node patch range. The benchmark still executed successfully in this environment.

---

## Scenario

The test measures a tiny update path:

```txt
count changes
  -> one text binding updates
  -> final DOM text becomes Count: 5000
```

This is useful for checking framework overhead in a single reactive text update. It does not measure full application performance, routing, forms, hydration, SSR, large tables, memory pressure, or browser layout cost.

---

## Median results

Median average update cost across 5 runs:

| Rank | Framework | Median avg update cost |
|---:|---|---:|
| 1 | Ariana v2 compiled preview | 1.506 µs/update |
| 2 | Vanilla TextNode | 1.764 µs/update |
| 3 | Ariana v1 runtime | 2.700 µs/update |
| 4 | Solid signal | 2.943 µs/update |
| 5 | Angular signal + detectChanges | 5.385 µs/update |
| 6 | Vanilla DOM textContent | 7.400 µs/update |
| 7 | Vue nextTick | 12.066 µs/update |
| 8 | React flushSync | 35.149 µs/update |

---

## Raw run values

Values are average microseconds per update.

| Framework | Run values |
|---|---|
| Ariana v2 compiled preview | 1.386, 1.534, 1.578, 1.434, 1.506 |
| Vanilla TextNode | 1.764, 1.823, 1.735, 1.824, 1.721 |
| Ariana v1 runtime | 2.625, 2.628, 2.776, 2.700, 2.796 |
| Solid signal | 2.933, 3.148, 2.994, 2.943, 2.943 |
| Angular signal + detectChanges | 5.283, 5.991, 5.154, 5.712, 5.385 |
| Vanilla DOM textContent | 7.400, 7.360, 7.421, 7.350, 7.630 |
| Vue nextTick | 11.802, 12.168, 12.956, 12.066, 11.965 |
| React flushSync | 35.300, 35.319, 34.866, 34.766, 35.149 |

---

## Interpretation

The v2 compiled preview is a direct-render path that represents where the compiler should eventually take Ariana templates. It does not yet mean Ariana has a full compiler. It means the runtime can now support compiler-generated render functions.

The result is encouraging:

```txt
Ariana v2 compiled preview is faster than Ariana v1 runtime in this test.
Ariana v2 compiled preview is faster than React, Vue, Angular, and Solid in this jsdom microbenchmark.
Ariana v2 compiled preview is close to direct TextNode updates.
```

Important: this does not prove Ariana is globally faster than these frameworks. It proves that the selected architecture can produce a very low-overhead update path for one signal-bound text node.

---

## Angular comparison note

Angular was measured with a signal-based component and explicit `detectChanges()` per update:

```txt
count.set(i)
changeDetectorRef.detectChanges()
```

This makes Angular commit every update in the same style that React was forced to commit via `flushSync` and Vue via `nextTick`.

---

## Engineering conclusion

The v2 direction is now clear:

1. Keep class-based components.
2. Keep external HTML/CSS.
3. Keep signals as the update primitive.
4. Replace runtime parsing with generated render functions.
5. Build the real compiler around the compiled-render path.
6. Move official performance work into a repeatable browser benchmark suite.

The next major implementation target is a real template compiler that turns this:

```html
<p>Count: {{ count() }}</p>
<button (click)="increment()">+</button>
```

into generated DOM instructions similar to the v2 compiled preview.

# Ariana Performance Results — 2026-06-25

This document records the first quick performance test for Ariana v1 alpha.

This is not a final framework benchmark. Ariana v1 still uses a temporary runtime template parser. Final React/Solid/Vue comparisons should happen after Ariana v2 introduces a production compiler.

---

## Environment

```txt
Runtime: Node.js 22.16.0
DOM environment: jsdom 29.1.1
Iterations per run: 5,000
Warmup updates per run: 500
Runs: 5
Scenario: one mounted counter component, one text binding, repeated synchronous count updates where possible
```

Framework/package versions used in this quick test:

```txt
Ariana: v1 alpha local build
React: 19.2.7
Vue: 3.5.39
Solid: 1.9.13
jsdom: 29.1.1
```

---

## Scenario

The test measures a very small update path:

```txt
count changes
  -> one text binding updates
  -> final DOM text becomes Count: 5000
```

This test is intentionally small. It is useful for checking framework overhead in a single reactive text update, but it does not measure full application performance.

---

## Median results

Median average update cost across 5 runs:

| Rank | Framework | Median avg update cost |
|---:|---|---:|
| 1 | Vanilla TextNode | 1.346 µs/update |
| 2 | Solid signal | 1.778 µs/update |
| 3 | Ariana v1 alpha | 3.383 µs/update |
| 4 | Vanilla DOM textContent | 9.027 µs/update |
| 5 | Vue nextTick | 13.788 µs/update |
| 6 | React flushSync | 35.557 µs/update |

---

## Raw run values

Values are average microseconds per update.

| Framework | Run values |
|---|---|
| Vanilla TextNode | 1.321, 1.322, 1.346, 1.397, 1.425 |
| Solid signal | 1.765, 1.766, 1.778, 1.845, 1.902 |
| Ariana v1 alpha | 3.234, 3.273, 3.383, 3.438, 3.592 |
| Vanilla DOM textContent | 8.865, 8.894, 9.027, 9.153, 9.304 |
| Vue nextTick | 13.498, 13.668, 13.788, 13.834, 14.194 |
| React flushSync | 35.191, 35.204, 35.557, 35.643, 35.692 |

---

## Interpretation

The result is encouraging but not final.

Ariana v1 alpha is faster than React and Vue in this tiny text-binding update benchmark. This is expected because Ariana updates signal-bound DOM directly instead of rerendering a component tree.

Ariana v1 alpha is slower than Solid and direct Vanilla TextNode updates. This is also expected because Ariana v1 still uses runtime expression evaluation and runtime template binding.

The target for Ariana v2 is to move closer to Solid and Vanilla TextNode by replacing runtime parsing with compiler-generated DOM instructions.

---

## Important limitations

- This test runs in jsdom, not a real browser.
- This is a microbenchmark, not a full app benchmark.
- React is measured with `flushSync` to force every update to commit immediately.
- Vue is measured with `nextTick` per update.
- Solid is measured through direct signal-driven text updates.
- Svelte is not included in this first quick test because a fair Svelte comparison should use compiled output through a build step.
- Ariana v1 is not production optimized yet.

---

## Engineering conclusion

The current direction is valid:

```txt
Ariana v1 alpha already beats React and Vue in this small update-path test.
Ariana does not yet beat Solid or direct TextNode updates.
Ariana v2 must focus on the compiler.
```

Next required work:

1. Add an official benchmark folder.
2. Create repeatable browser-based benchmarks.
3. Build the v2 template compiler.
4. Remove runtime expression evaluation from production output.
5. Re-run the benchmark against React, Vue, Solid, Svelte, and Vanilla DOM.

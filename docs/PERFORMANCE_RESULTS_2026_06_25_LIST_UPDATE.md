# Ariana Performance Results — keyed list update — 2026-06-25

This document records the performance test that matches the latest compiler change: keyed `@for` reconciliation.

Unlike the previous counter microbenchmark, this benchmark measures a list-specific update path.

---

## What changed before this test

Ariana's compiler now uses `track` in compiled `@for` blocks.

The generated code keeps a record map per list, reuses DOM nodes for stable keys, updates per-row item/index signals, moves nodes only when order changes, and removes records that no longer exist.

This is still a preview implementation, but it is no longer a full list recreate on every update.

---

## Environment

```txt
Runtime: Node.js 22.16.0
DOM environment: jsdom 29.1.1
Rows: 300
Iterations per run: 50
Warmup updates per run: 5
Runs: 3
Scenario: keyed list with one changed row per update
```

Framework/package versions used in this quick test:

```txt
Ariana: v2 keyed list compiler preview local build
React: 19.2.7
Vue: 3.5.39
Angular: 22.0.2
jsdom: 29.1.1
```

Angular emitted a component ID collision warning across repeated runs because the benchmark creates the same JIT component multiple times in the same Node process. The benchmark still completed successfully.

---

## Scenario

The benchmark creates 300 rows:

```txt
[{ id, name, active }, ...]
```

Each update changes exactly one row:

```txt
row.name changes
row.active toggles
```

The Ariana template shape is:

```html
<ul>
  @for (row of rows(); track row.id) {
    <li [class.active]="row.active">{{ row.name }}</li>
  }
</ul>
```

---

## Median results

Median average update cost across 3 runs:

| Rank | Framework | Median avg update cost |
|---:|---|---:|
| 1 | Vanilla keyed DOM | 92.209 µs/update |
| 2 | Angular @for signal + detectChanges | 666.105 µs/update |
| 3 | Ariana keyed @for compiler | 772.252 µs/update |
| 4 | Vue keyed v-for nextTick | 1,463.022 µs/update |
| 5 | React keyed list flushSync | 8,335.056 µs/update |
| 6 | Ariana recreate list | 11,331.802 µs/update |

---

## Raw run values

Values are average microseconds per update.

| Framework | Run values |
|---|---|
| Vanilla keyed DOM | 82.933, 92.209, 112.599 |
| Angular @for signal + detectChanges | 581.704, 666.105, 999.280 |
| Ariana keyed @for compiler | 745.127, 772.252, 835.306 |
| Vue keyed v-for nextTick | 1,460.700, 1,463.022, 1,607.138 |
| React keyed list flushSync | 5,482.561, 8,335.056, 10,907.326 |
| Ariana recreate list | 11,114.973, 11,331.802, 11,373.115 |

---

## Interpretation

The result is useful and more realistic than the counter microbenchmark.

Ariana's keyed `@for` compiler is much faster than the previous recreate-list path:

```txt
Ariana keyed @for compiler: 772.252 µs/update
Ariana recreate list:      11,331.802 µs/update
```

That is roughly a 14.7x improvement for this list-specific update scenario.

Ariana is also faster than Vue and React in this jsdom benchmark. Angular is slightly faster than Ariana in this particular run, which is important feedback: the next compiler work should reduce per-row overhead and improve row update scheduling.

---

## Important limitations

- This runs in jsdom, not a real browser.
- This is a small benchmark, not a full app benchmark.
- Ariana still uses a string/regex-based compiler preview.
- Ariana still has high mount cost because each row creates signal-based row bindings.
- Angular JIT warnings appeared because the same JIT component was created multiple times in one Node process.
- Real browser benchmarks are still required.

---

## Engineering conclusion

The keyed `@for` direction is valid.

The compiler now avoids full list recreation and reuses DOM nodes for stable keys. This is a major improvement over the recreate-list version.

Next work:

1. Reduce mount cost for compiled lists.
2. Avoid per-row signal overhead where static row bindings can be updated directly.
3. Add reorder-specific benchmarks.
4. Replace the string/regex compiler with a real template AST.
5. Move benchmarks into browser automation.

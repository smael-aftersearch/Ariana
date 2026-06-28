import { performance } from 'node:perf_hooks';
import { computed, signal } from '../../../packages/core/dist/index.js';

const rounds = Number(process.env.ARIA_BENCH_ROUNDS ?? 10);
const iterations = Number(process.env.ARIA_BENCH_COUNTER_ITERATIONS ?? 50000);

const results = [];

measure('signal-set-only', () => {
  const v = signal(0);
  return run => {
    for (let i = 0; i < run; i++) v.set(i);
    return v.peek();
  };
});

measure('computed-read-only', () => {
  const v = signal(1);
  const d = computed(() => v() * 2);
  d();
  return run => {
    let out = 0;
    for (let i = 0; i < run; i++) out = d();
    return out;
  };
});

measure('set-then-computed-read', () => {
  const v = signal(0);
  const d = computed(() => v() * 2);
  return run => {
    let out = 0;
    for (let i = 0; i < run; i++) {
      v.set(i);
      out = d();
    }
    return out;
  };
});

console.table(results);

function measure(name, factory) {
  const values = [];
  const test = factory();
  test(5000);
  for (let round = 0; round < rounds; round++) {
    const start = performance.now();
    const finalValue = test(iterations);
    values.push(performance.now() - start);
    if (finalValue === undefined) throw new Error(`${name}: invalid result`);
  }
  const sorted = values.toSorted((a, b) => a - b);
  results.push({ name, median_ms: pct(sorted, 0.5).toFixed(2), p75_ms: pct(sorted, 0.75).toFixed(2), max_ms: sorted.at(-1).toFixed(2) });
}

function pct(sorted, n) {
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * n) - 1)] ?? 0;
}

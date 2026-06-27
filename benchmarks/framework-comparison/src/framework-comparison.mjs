import { performance } from 'node:perf_hooks';
import React from 'react';
import { computed as vueComputed, effect as vueEffect, ref as vueRef } from '@vue/reactivity';
import { createEffect as solidEffect, createMemo as solidMemo, createRoot as solidRoot, createSignal as solidSignal } from 'solid-js';
import { writable as svelteWritable, derived as svelteDerived, get as svelteGet } from 'svelte/store';
import { computed as arianaComputed, effect as arianaEffect, signal as arianaSignal } from '../../packages/core/dist/index.js';

const iterations = Number(process.env.ARIA_BENCH_ITERATIONS ?? 50000);
const warmup = Number(process.env.ARIA_BENCH_WARMUP ?? 5000);
const rounds = Number(process.env.ARIA_BENCH_ROUNDS ?? 5);
const rows = [];

benchmark('Ariana signals', () => {
  const value = arianaSignal(0);
  const double = arianaComputed(() => value() * 2);
  let sink = 0;
  const stop = arianaEffect(() => { sink = double(); });
  return {
    update(index) { value.set(index); },
    read() { return sink; },
    cleanup() { stop(); }
  };
});

benchmark('Solid signals', () => solidRoot(dispose => {
  const [value, setValue] = solidSignal(0);
  const double = solidMemo(() => value() * 2);
  let sink = 0;
  solidEffect(() => { sink = double(); });
  return {
    update(index) { setValue(index); },
    read() { return sink; },
    cleanup() { dispose(); }
  };
}));

benchmark('Vue reactivity', () => {
  const value = vueRef(0);
  const double = vueComputed(() => value.value * 2);
  let sink = 0;
  const stop = vueEffect(() => { sink = double.value; });
  return {
    update(index) { value.value = index; },
    read() { return sink; },
    cleanup() { stop(); }
  };
});

benchmark('Svelte store', () => {
  const value = svelteWritable(0);
  const double = svelteDerived(value, current => current * 2);
  let sink = 0;
  const unsubscribe = double.subscribe(current => { sink = current; });
  return {
    update(index) { value.set(index); },
    read() { return svelteGet(double) + sink - sink; },
    cleanup() { unsubscribe(); }
  };
});

benchmark('React createElement baseline', () => {
  let sink = 0;
  return {
    update(index) {
      const element = React.createElement('span', null, index * 2);
      sink = element.props.children;
    },
    read() { return sink; },
    cleanup() {}
  };
});

console.log('Framework comparison benchmark');
console.log(`iterations=${iterations}, warmup=${warmup}, rounds=${rounds}`);
console.table(rows.map(row => ({ framework: row.name, best_ms: row.best.toFixed(2), avg_ms: row.average.toFixed(2), final_value: row.finalValue })));

function benchmark(name, createCase) {
  const durations = [];
  let finalValue = 0;

  for (let round = 0; round < rounds; round++) {
    const testCase = createCase();
    for (let index = 0; index < warmup; index++) testCase.update(index);
    const start = performance.now();
    for (let index = 0; index < iterations; index++) testCase.update(index);
    const duration = performance.now() - start;
    finalValue = testCase.read();
    testCase.cleanup();
    if (finalValue !== (iterations - 1) * 2) throw new Error(`${name} produced unexpected value: ${finalValue}`);
    durations.push(duration);
  }

  rows.push({
    name,
    best: Math.min(...durations),
    average: durations.reduce((sum, value) => sum + value, 0) / durations.length,
    finalValue
  });
}

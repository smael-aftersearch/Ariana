import '@angular/compiler';
import { performance } from 'node:perf_hooks';
import React from 'react';
import { computed as angularComputed, signal as angularSignal } from '@angular/core';
import { FormArray as AngularFormArray, FormControl as AngularFormControl } from '@angular/forms';
import { computed as vueComputed, ref as vueRef } from '@vue/reactivity';
import { createMemo as solidMemo, createRoot as solidRoot, createSignal as solidSignal } from 'solid-js/dist/solid.js';
import { derived as svelteDerived, get as svelteGet, writable as svelteWritable } from 'svelte/store';
import { computed as arianaComputed, signal as arianaSignal } from '../../../packages/core/dist/index.js';
import { formArray as arianaFormArray, formControl as arianaFormControl } from '../../../packages/forms/dist/index.js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const frameworks = ['Ariana', 'Angular', 'React', 'Vue', 'Svelte', 'Solid'];
const rounds = Number(process.env.ARIA_BENCH_ROUNDS ?? 10);
const warmup = Number(process.env.ARIA_BENCH_WARMUP ?? 5000);
const counterIterations = Number(process.env.ARIA_BENCH_COUNTER_ITERATIONS ?? 50000);
const listSize = Number(process.env.ARIA_BENCH_LIST_SIZE ?? 1000);
const listUpdates = Number(process.env.ARIA_BENCH_LIST_UPDATES ?? 1000);
const largeListSize = Number(process.env.ARIA_BENCH_LARGE_LIST_SIZE ?? 10000);
const largeListMoves = Number(process.env.ARIA_BENCH_LARGE_LIST_MOVES ?? 100);
const arraySize = Number(process.env.ARIA_BENCH_ARRAY_SIZE ?? 2000);
const arrayMoves = Number(process.env.ARIA_BENCH_ARRAY_MOVES ?? 50);
const results = [];

for (const framework of frameworks) measure('derived-counter', framework, createCounterCase(framework), counterIterations, iterations => (iterations - 1) * 2, { warmupIterations: warmup });
for (const framework of frameworks) measure('list-1000-update', framework, createListCase(framework, listSize, 'update'), listUpdates, totalIterations => sumRange(listSize) + totalIterations, { warmupIterations: warmup });
for (const framework of frameworks) measure('list-10000-move', framework, createListCase(framework, largeListSize, 'move'), largeListMoves, () => largeListSize);
for (const framework of frameworks) measure('array-push-move', framework, createArrayCase(framework), 1, () => arraySize);

const metadata = { generatedAt: new Date().toISOString(), node: process.version, platform: process.platform, arch: process.arch, rounds, warmup, counterIterations, listSize, listUpdates, largeListSize, largeListMoves, arraySize, arrayMoves };
const outDir = join(process.cwd(), 'results');
const markdown = renderMarkdown(metadata, results);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'latest.json'), `${JSON.stringify({ metadata, results }, null, 2)}\n`);
writeFileSync(join(outDir, 'latest.md'), markdown);
console.log('Framework comparison benchmark');
console.table(results.map(row => ({ scenario: row.scenario, framework: row.framework, median_ms: row.median.toFixed(2), p75_ms: row.p75.toFixed(2), p95_ms: row.p95.toFixed(2), max_ms: row.max.toFixed(2) })));
console.log(`Wrote ${join(outDir, 'latest.json')}`);
console.log(`Wrote ${join(outDir, 'latest.md')}`);

function createCounterCase(framework) {
  if (framework === 'Ariana') {
    const value = arianaSignal(0);
    const double = arianaComputed(() => value() * 2);
    return loop(index => { value.set(index); return double(); });
  }
  if (framework === 'Angular') {
    const value = angularSignal(0);
    const double = angularComputed(() => value() * 2);
    return loop(index => { value.set(index); return double(); });
  }
  if (framework === 'Vue') {
    const value = vueRef(0);
    const double = vueComputed(() => value.value * 2);
    return loop(index => { value.value = index; return double.value; });
  }
  if (framework === 'Svelte') {
    const value = svelteWritable(0);
    const double = svelteDerived(value, current => current * 2);
    const unsubscribe = double.subscribe(() => {});
    return { ...loop(index => { value.set(index); return svelteGet(double); }), cleanup: unsubscribe };
  }
  if (framework === 'Solid') {
    return solidRoot(dispose => {
      const [value, setValue] = solidSignal(0);
      const double = solidMemo(() => value() * 2);
      return { ...loop(index => { setValue(index); return double(); }), cleanup: dispose };
    });
  }
  return loop(index => React.createElement('span', null, index * 2).props.children);
}

function loop(update) {
  return { run(iterations) { let sink = 0; for (let index = 0; index < iterations; index++) sink = update(index); return sink; } };
}

function createListCase(framework, size, mode) {
  const initial = Array.from({ length: size }, (_, index) => index);
  const transform = (items, iteration) => mode === 'move'
    ? [items[items.length - 1], ...items.slice(0, items.length - 1)]
    : items.map((item, index) => index === iteration % size ? item + 1 : item);
  const finish = items => mode === 'move' ? items.length : items.reduce((sum, item) => sum + item, 0);

  if (framework === 'Ariana') return signalList(arianaSignal, initial, transform, finish);
  if (framework === 'Angular') return signalList(angularSignal, initial, transform, finish);
  if (framework === 'Vue') { const state = vueRef(initial); return { run(n) { for (let i = 0; i < n; i++) state.value = transform(state.value, i); return finish(state.value); } }; }
  if (framework === 'Svelte') { const state = svelteWritable(initial); return { run(n) { for (let i = 0; i < n; i++) state.update(items => transform(items, i)); return finish(svelteGet(state)); } }; }
  if (framework === 'Solid') return solidRoot(dispose => { const [state, setState] = solidSignal(initial); return { run(n) { for (let i = 0; i < n; i++) setState(items => transform(items, i)); return finish(state()); }, cleanup: dispose }; });
  return { run(n) { let state = initial; for (let i = 0; i < n; i++) state = transform(state, i); return finish(state); } };
}

function signalList(factory, initial, transform, finish) {
  const state = factory(initial);
  return { run(n) { for (let i = 0; i < n; i++) state.update(items => transform(items, i)); return finish(state()); } };
}

function createArrayCase(framework) {
  if (framework === 'Ariana') return { run() { const array = arianaFormArray([]); for (let i = 0; i < arraySize; i++) array.push(arianaFormControl(i)); for (let i = 0; i < arrayMoves; i++) array.move(array.length() - 1, 0); return array.length(); } };
  if (framework === 'Angular') return { run() { const array = new AngularFormArray([]); for (let i = 0; i < arraySize; i++) array.push(new AngularFormControl(i), { emitEvent: false }); for (let i = 0; i < arrayMoves; i++) { const item = array.at(array.length - 1); array.removeAt(array.length - 1, { emitEvent: false }); array.insert(0, item, { emitEvent: false }); } return array.length; } };
  if (framework === 'Vue') return { run() { const array = vueRef([]); for (let i = 0; i < arraySize; i++) array.value.push(i); for (let i = 0; i < arrayMoves; i++) array.value.unshift(array.value.pop()); return array.value.length; } };
  if (framework === 'Svelte') return { run() { const store = svelteWritable([]); for (let i = 0; i < arraySize; i++) store.update(array => [...array, i]); for (let i = 0; i < arrayMoves; i++) store.update(array => [array[array.length - 1], ...array.slice(0, array.length - 1)]); return svelteGet(store).length; } };
  if (framework === 'Solid') return solidRoot(dispose => { const [array, setArray] = solidSignal([]); return { run() { for (let i = 0; i < arraySize; i++) setArray(items => [...items, i]); for (let i = 0; i < arrayMoves; i++) setArray(items => [items[items.length - 1], ...items.slice(0, items.length - 1)]); return array().length; }, cleanup: dispose }; });
  return { run() { let array = []; for (let i = 0; i < arraySize; i++) array = [...array, i]; for (let i = 0; i < arrayMoves; i++) array = [array[array.length - 1], ...array.slice(0, array.length - 1)]; return array.length; } };
}

function measure(scenario, framework, testCase, iterations, expectedValue, options = {}) {
  const values = [];
  let finalValue = 0;
  const warmupIterations = options.warmupIterations ?? 0;
  if (warmupIterations > 0) testCase.run(warmupIterations);
  for (let round = 0; round < rounds; round++) {
    const start = performance.now();
    finalValue = testCase.run(iterations);
    values.push(performance.now() - start);
    const expected = expectedValue(warmupIterations + ((round + 1) * iterations));
    if (finalValue !== expected) throw new Error(`${scenario}/${framework}: ${finalValue} !== ${expected}`);
  }
  testCase.cleanup?.();
  const sorted = [...values].sort((a, b) => a - b);
  results.push({ scenario, framework, finalValue, unit: 'ms', min: sorted[0], median: pct(sorted, 0.5), p75: pct(sorted, 0.75), p95: pct(sorted, 0.95), max: sorted[sorted.length - 1], runs: values });
}

function sumRange(length) { return (length * (length - 1)) / 2; }
function pct(sorted, n) { return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * n) - 1)] ?? 0; }
function unique(values) { return [...new Set(values)]; }

function renderMarkdown(metadata, rows) {
  const lines = ['# Framework Comparison Benchmark Results', '', 'Generated by `npm run bench:framework`. Every scenario listed here has numeric results for Ariana, Angular, React, Vue, Svelte, and Solid.', '', '| Field | Value |', '| --- | --- |'];
  for (const [key, value] of Object.entries(metadata)) lines.push(`| ${key} | ${value} |`);
  lines.push('', '## Pivot comparison', '', pivot(rows), '', '## Detailed results', '', '| Scenario | Framework | Median ms | p75 ms | p95 ms | Max ms |', '| --- | --- | ---: | ---: | ---: | ---: |');
  for (const row of rows) lines.push(`| ${row.scenario} | ${row.framework} | ${row.median.toFixed(2)} | ${row.p75.toFixed(2)} | ${row.p95.toFixed(2)} | ${row.max.toFixed(2)} |`);
  lines.push('', '## Scenario winners by median', '', '| Scenario | Winner | Winner median | Slowest | Slowest median | Slowest / winner |', '| --- | --- | ---: | --- | ---: | ---: |');
  for (const scenario of unique(rows.map(row => row.scenario))) {
    const group = rows.filter(row => row.scenario === scenario).sort((a, b) => a.median - b.median);
    const best = group[0];
    const worst = group[group.length - 1];
    lines.push(`| ${scenario} | ${best.framework} | ${best.median.toFixed(2)} ms | ${worst.framework} | ${worst.median.toFixed(2)} ms | ${(worst.median / best.median).toFixed(2)}x |`);
  }
  return `${lines.join('\n')}\n`;
}

function pivot(rows) {
  const lines = ['| Scenario | Ariana | Angular | React | Vue | Svelte | Solid |', '| --- | ---: | ---: | ---: | ---: | ---: | ---: |'];
  for (const scenario of unique(rows.map(row => row.scenario))) {
    const map = new Map(rows.filter(row => row.scenario === scenario).map(row => [row.framework, row]));
    lines.push(`| ${scenario} | ${frameworks.map(framework => map.get(framework).median.toFixed(2)).join(' | ')} |`);
  }
  return lines.join('\n');
}

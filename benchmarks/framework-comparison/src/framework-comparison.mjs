import '@angular/compiler';
import { performance } from 'node:perf_hooks';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { computed as angularComputed, signal as angularSignal } from '@angular/core';
import { FormArray as AngularFormArray, FormControl as AngularFormControl } from '@angular/forms';
import { computed as vueComputed, ref as vueRef } from '@vue/reactivity';
import { createMemo as solidMemo, createRoot as solidRoot, createSignal as solidSignal } from 'solid-js/dist/solid.js';
import { derived as svelteDerived, get as svelteGet, writable as svelteWritable } from 'svelte/store';
import { computed as arianaComputed, signal as arianaSignal } from '../../../packages/core/dist/index.js';
import { formArray as arianaFormArray, formControl as arianaFormControl } from '../../../packages/forms/dist/index.js';

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

for (const framework of frameworks) measure('derived-counter', framework, counter(framework), counterIterations, n => (n - 1) * 2);
for (const framework of frameworks) measure('list-1000-update', framework, list(framework, listSize, 'update'), listUpdates, n => sumRange(listSize) + n, { warmupIterations: warmup, cumulative: true });
for (const framework of frameworks) measure('list-10000-move', framework, list(framework, largeListSize, 'move'), largeListMoves, () => largeListSize);
for (const framework of frameworks) measure('array-push-move', framework, arrayCase(framework), 1, () => arraySize);

const metadata = { generatedAt: new Date().toISOString(), node: process.version, platform: process.platform, arch: process.arch, rounds, warmup, counterIterations, listSize, listUpdates, largeListSize, largeListMoves, arraySize, arrayMoves };
const outDir = join(process.cwd(), 'results');
const markdown = report(metadata, results);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'latest.json'), `${JSON.stringify({ metadata, results }, null, 2)}\n`);
writeFileSync(join(outDir, 'latest.md'), markdown);
console.log('Framework comparison benchmark');
console.table(results.map(r => ({ scenario: r.scenario, framework: r.framework, median_ms: r.median.toFixed(2), p75_ms: r.p75.toFixed(2), p95_ms: r.p95.toFixed(2), max_ms: r.max.toFixed(2) })));

function counter(name) {
  if (name === 'Ariana') { const v = arianaSignal(0); const d = arianaComputed(() => v() * 2); return loop(i => { v.set(i); return d(); }); }
  if (name === 'Angular') { const v = angularSignal(0); const d = angularComputed(() => v() * 2); return loop(i => { v.set(i); return d(); }); }
  if (name === 'Vue') { const v = vueRef(0); const d = vueComputed(() => v.value * 2); return loop(i => { v.value = i; return d.value; }); }
  if (name === 'Svelte') { const v = svelteWritable(0); const d = svelteDerived(v, x => x * 2); const off = d.subscribe(() => {}); return { ...loop(i => { v.set(i); return svelteGet(d); }), cleanup: off }; }
  if (name === 'Solid') return solidRoot(dispose => { const [v, setV] = solidSignal(0); const d = solidMemo(() => v() * 2); return { ...loop(i => { setV(i); return d(); }), cleanup: dispose }; });
  return loop(i => React.createElement('span', null, i * 2).props.children);
}

function list(name, size, mode) {
  const initial = Array.from({ length: size }, (_, i) => i);
  const transform = (items, i) => mode === 'move' ? [items[items.length - 1], ...items.slice(0, -1)] : items.map((x, index) => index === i % size ? x + 1 : x);
  const finish = items => mode === 'move' ? items.length : items.reduce((a, b) => a + b, 0);
  if (name === 'Ariana') return signalList(arianaSignal, initial, transform, finish);
  if (name === 'Angular') return signalList(angularSignal, initial, transform, finish);
  if (name === 'Vue') { const s = vueRef(initial); return { run(n) { for (let i = 0; i < n; i++) s.value = transform(s.value, i); return finish(s.value); } }; }
  if (name === 'Svelte') { const s = svelteWritable(initial); return { run(n) { for (let i = 0; i < n; i++) s.update(items => transform(items, i)); return finish(svelteGet(s)); } }; }
  if (name === 'Solid') return solidRoot(dispose => { const [s, setS] = solidSignal(initial); return { run(n) { for (let i = 0; i < n; i++) setS(items => transform(items, i)); return finish(s()); }, cleanup: dispose }; });
  let reactState = initial;
  return { run(n) { for (let i = 0; i < n; i++) reactState = transform(reactState, i); return finish(reactState); } };
}

function arrayCase(name) {
  if (name === 'Ariana') return { run() { const a = arianaFormArray([]); for (let i = 0; i < arraySize; i++) a.push(arianaFormControl(i)); for (let i = 0; i < arrayMoves; i++) a.move(a.length() - 1, 0); return a.length(); } };
  if (name === 'Angular') return { run() { const a = new AngularFormArray([]); for (let i = 0; i < arraySize; i++) a.push(new AngularFormControl(i), { emitEvent: false }); for (let i = 0; i < arrayMoves; i++) { const item = a.at(a.length - 1); a.removeAt(a.length - 1, { emitEvent: false }); a.insert(0, item, { emitEvent: false }); } return a.length; } };
  if (name === 'Vue') return { run() { const a = vueRef([]); for (let i = 0; i < arraySize; i++) a.value.push(i); for (let i = 0; i < arrayMoves; i++) a.value.unshift(a.value.pop()); return a.value.length; } };
  if (name === 'Svelte') return { run() { const s = svelteWritable([]); for (let i = 0; i < arraySize; i++) s.update(a => [...a, i]); for (let i = 0; i < arrayMoves; i++) s.update(a => [a[a.length - 1], ...a.slice(0, -1)]); return svelteGet(s).length; } };
  if (name === 'Solid') return solidRoot(dispose => { const [a, setA] = solidSignal([]); return { run() { for (let i = 0; i < arraySize; i++) setA(items => [...items, i]); for (let i = 0; i < arrayMoves; i++) setA(items => [items[items.length - 1], ...items.slice(0, -1)]); return a().length; }, cleanup: dispose }; });
  return { run() { let a = []; for (let i = 0; i < arraySize; i++) a = [...a, i]; for (let i = 0; i < arrayMoves; i++) a = [a[a.length - 1], ...a.slice(0, -1)]; return a.length; } };
}

function loop(fn) { return { run(n) { let out = 0; for (let i = 0; i < n; i++) out = fn(i); return out; } }; }
function signalList(factory, initial, transform, finish) { const s = factory(initial); return { run(n) { for (let i = 0; i < n; i++) s.update(items => transform(items, i)); return finish(s()); } }; }
function sumRange(n) { return (n * (n - 1)) / 2; }
function pct(sorted, n) { return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * n) - 1)] ?? 0; }
function unique(values) { return [...new Set(values)]; }

function measure(scenario, framework, testCase, iterations, expectedValue, options = {}) {
  const values = [];
  const warmupIterations = options.warmupIterations ?? 0;
  const cumulative = options.cumulative === true;
  let finalValue = 0;
  if (warmupIterations > 0) testCase.run(warmupIterations);
  for (let round = 0; round < rounds; round++) {
    const start = performance.now();
    finalValue = testCase.run(iterations);
    values.push(performance.now() - start);
    const expectedInput = cumulative ? warmupIterations + ((round + 1) * iterations) : iterations;
    const expected = expectedValue(expectedInput);
    if (finalValue !== expected) throw new Error(`${scenario}/${framework}: ${finalValue} !== ${expected}`);
  }
  testCase.cleanup?.();
  const sorted = [...values].sort((a, b) => a - b);
  results.push({ scenario, framework, finalValue, unit: 'ms', min: sorted[0], median: pct(sorted, 0.5), p75: pct(sorted, 0.75), p95: pct(sorted, 0.95), max: sorted[sorted.length - 1], runs: values });
}

function report(metadata, rows) {
  const lines = ['# Framework Comparison Benchmark Results', '', 'Generated by `npm run bench:framework`. Every scenario listed here has numeric results for Ariana, Angular, React, Vue, Svelte, and Solid.', '', '| Field | Value |', '| --- | --- |'];
  for (const [key, value] of Object.entries(metadata)) lines.push(`| ${key} | ${value} |`);
  lines.push('', '## Pivot comparison', '', pivot(rows), '', '## Detailed results', '', '| Scenario | Framework | Median ms | p75 ms | p95 ms | Max ms |', '| --- | --- | ---: | ---: | ---: | ---: |');
  for (const row of rows) lines.push(`| ${row.scenario} | ${row.framework} | ${row.median.toFixed(2)} | ${row.p75.toFixed(2)} | ${row.p95.toFixed(2)} | ${row.max.toFixed(2)} |`);
  lines.push('', '## Scenario winners by median', '', '| Scenario | Winner | Winner median | Slowest | Slowest median | Slowest / winner |', '| --- | --- | ---: | --- | ---: | ---: |');
  for (const scenario of unique(rows.map(row => row.scenario))) { const group = rows.filter(row => row.scenario === scenario).sort((a, b) => a.median - b.median); const best = group[0]; const worst = group[group.length - 1]; lines.push(`| ${scenario} | ${best.framework} | ${best.median.toFixed(2)} ms | ${worst.framework} | ${worst.median.toFixed(2)} ms | ${(worst.median / best.median).toFixed(2)}x |`); }
  return `${lines.join('\n')}\n`;
}

function pivot(rows) {
  const lines = ['| Scenario | Ariana | Angular | React | Vue | Svelte | Solid |', '| --- | ---: | ---: | ---: | ---: | ---: | ---: |'];
  for (const scenario of unique(rows.map(row => row.scenario))) { const map = new Map(rows.filter(row => row.scenario === scenario).map(row => [row.framework, row])); lines.push(`| ${scenario} | ${frameworks.map(framework => map.get(framework).median.toFixed(2)).join(' | ')} |`); }
  return lines.join('\n');
}

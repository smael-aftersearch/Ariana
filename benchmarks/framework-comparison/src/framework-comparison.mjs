import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import process from 'node:process';
import React from 'react';
import { computed as angularComputed, signal as angularSignal } from '@angular/core';
import { FormArray as AngularFormArray, FormControl as AngularFormControl } from '@angular/forms';
import { computed as vueComputed, ref as vueRef } from '@vue/reactivity';
import { createMemo as solidMemo, createRoot as solidRoot, createSignal as solidSignal } from 'solid-js';
import { derived as svelteDerived, get as svelteGet, writable as svelteWritable } from 'svelte/store';
import { computed as arianaComputed, signal as arianaSignal } from '../../../packages/core/dist/index.js';
import { formArray as arianaFormArray, formControl as arianaFormControl } from '../../../packages/forms/dist/index.js';

const counterIterations = Number(process.env.ARIA_BENCH_COUNTER_ITERATIONS ?? 50000);
const arraySize = Number(process.env.ARIA_BENCH_ARRAY_SIZE ?? 2000);
const arrayMoves = Number(process.env.ARIA_BENCH_ARRAY_MOVES ?? 50);
const warmup = Number(process.env.ARIA_BENCH_WARMUP ?? 5000);
const rounds = Number(process.env.ARIA_BENCH_ROUNDS ?? 10);
const outDir = join(process.cwd(), 'results');
const results = [];

runScenario('derived-counter', 'Ariana', 'signal/computed update + derived read', () => {
  const value = arianaSignal(0);
  const double = arianaComputed(() => value() * 2);
  return {
    run(iterations) {
      let sink = 0;
      for (let index = 0; index < iterations; index++) {
        value.set(index);
        sink = double();
      }
      return sink;
    }
  };
}, counterIterations, (iterations) => (iterations - 1) * 2);

runScenario('derived-counter', 'Angular', 'signal/computed update + derived read', () => {
  const value = angularSignal(0);
  const double = angularComputed(() => value() * 2);
  return {
    run(iterations) {
      let sink = 0;
      for (let index = 0; index < iterations; index++) {
        value.set(index);
        sink = double();
      }
      return sink;
    }
  };
}, counterIterations, (iterations) => (iterations - 1) * 2);

runScenario('derived-counter', 'Solid', 'signal/memo update + derived read', () => solidRoot(dispose => {
  const [value, setValue] = solidSignal(0);
  const double = solidMemo(() => value() * 2);
  return {
    run(iterations) {
      let sink = 0;
      for (let index = 0; index < iterations; index++) {
        setValue(index);
        sink = double();
      }
      return sink;
    },
    cleanup: dispose
  };
}), counterIterations, (iterations) => (iterations - 1) * 2);

runScenario('derived-counter', 'Vue', 'ref/computed update + derived read', () => {
  const value = vueRef(0);
  const double = vueComputed(() => value.value * 2);
  return {
    run(iterations) {
      let sink = 0;
      for (let index = 0; index < iterations; index++) {
        value.value = index;
        sink = double.value;
      }
      return sink;
    }
  };
}, counterIterations, (iterations) => (iterations - 1) * 2);

runScenario('derived-counter', 'Svelte', 'writable/derived update + derived read', () => {
  const value = svelteWritable(0);
  const double = svelteDerived(value, current => current * 2);
  const unsubscribe = double.subscribe(() => {});
  return {
    run(iterations) {
      let sink = 0;
      for (let index = 0; index < iterations; index++) {
        value.set(index);
        sink = svelteGet(double);
      }
      return sink;
    },
    cleanup: unsubscribe
  };
}, counterIterations, (iterations) => (iterations - 1) * 2);

runScenario('derived-counter', 'React', 'createElement derived render-object baseline; not React DOM state', () => ({
  run(iterations) {
    let sink = 0;
    for (let index = 0; index < iterations; index++) {
      const element = React.createElement('span', null, index * 2);
      sink = element.props.children;
    }
    return sink;
  }
}), counterIterations, (iterations) => (iterations - 1) * 2);

runScenario('array-push-move', 'Ariana', 'FormArray push controls + move last to first', () => ({
  run() {
    const array = arianaFormArray([]);
    for (let index = 0; index < arraySize; index++) array.push(arianaFormControl(index));
    for (let index = 0; index < arrayMoves; index++) array.move(array.length() - 1, 0);
    return array.length();
  }
}), 1, () => arraySize);

runScenario('array-push-move', 'Angular', 'FormArray push controls + move last to first', () => ({
  run() {
    const array = new AngularFormArray([]);
    for (let index = 0; index < arraySize; index++) array.push(new AngularFormControl(index), { emitEvent: false });
    for (let index = 0; index < arrayMoves; index++) {
      const control = array.at(array.length - 1);
      array.removeAt(array.length - 1, { emitEvent: false });
      array.insert(0, control, { emitEvent: false });
    }
    return array.length;
  }
}), 1, () => arraySize);

runScenario('array-push-move', 'React', 'immutable array state push + move last to first; not a form library', () => ({
  run() {
    let array = [];
    for (let index = 0; index < arraySize; index++) array = [...array, index];
    for (let index = 0; index < arrayMoves; index++) {
      const last = array[array.length - 1];
      array = [last, ...array.slice(0, array.length - 1)];
    }
    return array.length;
  }
}), 1, () => arraySize);

runScenario('array-push-move', 'Vue', 'ref array push + move last to first', () => ({
  run() {
    const array = vueRef([]);
    for (let index = 0; index < arraySize; index++) array.value.push(index);
    for (let index = 0; index < arrayMoves; index++) array.value.unshift(array.value.pop());
    return array.value.length;
  }
}), 1, () => arraySize);

runScenario('array-push-move', 'Svelte', 'writable array update + move last to first', () => ({
  run() {
    const store = svelteWritable([]);
    for (let index = 0; index < arraySize; index++) store.update(array => [...array, index]);
    for (let index = 0; index < arrayMoves; index++) store.update(array => [array[array.length - 1], ...array.slice(0, array.length - 1)]);
    return svelteGet(store).length;
  }
}), 1, () => arraySize);

runScenario('array-push-move', 'Solid', 'signal array update + move last to first', () => solidRoot(dispose => {
  const [array, setArray] = solidSignal([]);
  return {
    run() {
      for (let index = 0; index < arraySize; index++) setArray(items => [...items, index]);
      for (let index = 0; index < arrayMoves; index++) setArray(items => [items[items.length - 1], ...items.slice(0, items.length - 1)]);
      return array().length;
    },
    cleanup: dispose
  };
}), 1, () => arraySize);

const metadata = {
  generatedAt: new Date().toISOString(),
  node: process.version,
  platform: process.platform,
  arch: process.arch,
  rounds,
  warmup,
  counterIterations,
  arraySize,
  arrayMoves,
  notes: [
    'derived-counter compares reactive primitive behavior where available.',
    'React derived-counter is a createElement render-object baseline, not React DOM state.',
    'array-push-move compares Ariana and Angular official form arrays, but React/Vue/Svelte/Solid use framework-state array equivalents because they do not ship a directly equivalent official FormArray in core.'
  ]
};

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'latest.json'), `${JSON.stringify({ metadata, results }, null, 2)}\n`);
writeFileSync(join(outDir, 'latest.md'), renderMarkdown(metadata, results));

console.log('Framework comparison benchmark');
console.log(`counterIterations=${counterIterations}, arraySize=${arraySize}, arrayMoves=${arrayMoves}, warmup=${warmup}, rounds=${rounds}`);
console.table(results.map(result => ({
  scenario: result.scenario,
  framework: result.framework,
  median_ms: result.medianMs.toFixed(2),
  p75_ms: result.p75Ms.toFixed(2),
  p95_ms: result.p95Ms.toFixed(2),
  max_ms: result.maxMs.toFixed(2),
  final_value: result.finalValue
})));
console.log(`Wrote ${join(outDir, 'latest.json')}`);
console.log(`Wrote ${join(outDir, 'latest.md')}`);

function runScenario(scenario, framework, description, createCase, iterations, expectedValue) {
  const durations = [];
  let finalValue = 0;

  for (let round = 0; round < rounds; round++) {
    const testCase = createCase();
    if (iterations > 1 && typeof testCase.run === 'function') testCase.run(warmup);
    const start = performance.now();
    finalValue = testCase.run(iterations);
    const duration = performance.now() - start;
    if (testCase.cleanup) testCase.cleanup();
    const expected = expectedValue(iterations);
    if (finalValue !== expected) throw new Error(`${framework} ${scenario} produced ${finalValue}; expected ${expected}`);
    durations.push(duration);
  }

  const sorted = [...durations].sort((left, right) => left - right);
  results.push({
    scenario,
    framework,
    description,
    iterations,
    finalValue,
    minMs: sorted[0],
    medianMs: percentile(sorted, 0.5),
    p75Ms: percentile(sorted, 0.75),
    p95Ms: percentile(sorted, 0.95),
    maxMs: sorted[sorted.length - 1],
    runsMs: durations
  });
}

function percentile(sorted, percent) {
  if (sorted.length === 0) return 0;
  const index = Math.min(sorted.length - 1, Math.ceil(sorted.length * percent) - 1);
  return sorted[index];
}

function renderMarkdown(metadata, rows) {
  const lines = [];
  lines.push('# Framework Comparison Benchmark Results');
  lines.push('');
  lines.push('| Field | Value |');
  lines.push('| --- | --- |');
  lines.push(`| Generated at | ${metadata.generatedAt} |`);
  lines.push(`| Node | ${metadata.node} |`);
  lines.push(`| Platform | ${metadata.platform}/${metadata.arch} |`);
  lines.push(`| Rounds | ${metadata.rounds} |`);
  lines.push(`| Warmup | ${metadata.warmup} |`);
  lines.push(`| Counter iterations | ${metadata.counterIterations} |`);
  lines.push(`| Array size | ${metadata.arraySize} |`);
  lines.push(`| Array moves | ${metadata.arrayMoves} |`);
  lines.push('');
  lines.push('## Notes');
  lines.push('');
  for (const note of metadata.notes) lines.push(`- ${note}`);
  lines.push('');
  lines.push('## Results');
  lines.push('');
  lines.push('| Scenario | Framework | Median ms | p75 ms | p95 ms | Max ms | Description |');
  lines.push('| --- | --- | ---: | ---: | ---: | ---: | --- |');
  for (const row of rows) {
    lines.push(`| ${row.scenario} | ${row.framework} | ${row.medianMs.toFixed(2)} | ${row.p75Ms.toFixed(2)} | ${row.p95Ms.toFixed(2)} | ${row.maxMs.toFixed(2)} | ${row.description} |`);
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

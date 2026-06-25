import { performance } from 'node:perf_hooks';
import { listSignal } from '../../packages/core/dist/index.js';

const ROWS = Number(process.env.ROWS ?? 300);
const ITERATIONS = Number(process.env.ITERATIONS ?? 50000);
const WARMUP = Number(process.env.WARMUP ?? 5000);
const RUNS = Number(process.env.RUNS ?? 5);

function createRows(count = ROWS) {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    name: `User ${index}`,
    active: index === 0
  }));
}

function updateOne(row, index) {
  return {
    ...row,
    name: `User ${index} updated`,
    active: !row.active
  };
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function run(name, setup, update) {
  const values = [];
  let checksum = 0;

  for (let run = 0; run < RUNS; run++) {
    const state = setup();

    for (let i = 0; i < WARMUP; i++) {
      checksum += update(state, i % ROWS) ?? 0;
    }

    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
      checksum += update(state, i % ROWS) ?? 0;
    }
    const elapsed = performance.now() - start;
    values.push((elapsed * 1000) / ITERATIONS);
  }

  return {
    name,
    median: median(values),
    values,
    checksum
  };
}

const results = [];

results.push(run('Map direct targeted update', () => {
  const map = new Map(createRows().map(row => [row.id, row]));
  return { map };
}, (state, key) => {
  const previous = state.map.get(key);
  const next = updateOne(previous, key);
  state.map.set(key, next);
  return next.active ? 1 : 0;
}));

results.push(run('Ariana listSignal updateByKey', () => {
  const rows = listSignal(createRows(), row => row.id);
  const state = { rows, deliveries: 0 };
  rows.subscribeChanges(change => {
    if (change.type === 'update') state.deliveries += 1;
  });
  return state;
}, (state, key) => {
  state.rows.updateByKey(key, row => updateOne(row, key));
  return state.deliveries;
}));

results.push(run('Array full scan update', () => {
  return { rows: createRows() };
}, (state, key) => {
  state.rows = state.rows.map(row => row.id === key ? updateOne(row, key) : row);
  return state.rows[key].active ? 1 : 0;
}));

const table = results
  .map(result => ({
    strategy: result.name,
    medianUs: Number(result.median.toFixed(3)),
    runs: result.values.map(value => Number(value.toFixed(3))).join(', '),
    checksum: result.checksum
  }))
  .sort((a, b) => a.medianUs - b.medianUs);

console.table(table);
console.log(JSON.stringify({ rows: ROWS, iterations: ITERATIONS, warmup: WARMUP, runs: RUNS, table }, null, 2));

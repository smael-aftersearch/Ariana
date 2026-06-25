import { performance } from 'node:perf_hooks';
import { createRouter } from '@ariana/router';

const ROUTES = Number(process.env.ROUTES ?? 500);
const ITERATIONS = Number(process.env.ITERATIONS ?? 50000);
const RUNS = Number(process.env.RUNS ?? 5);

class Page {}

const routes = [];
for (let i = 0; i < ROUTES; i++) {
  routes.push({
    path: `/area-${i}`,
    component: Page,
    data: { area: i },
    providers: [{ provide: Symbol.for(`area-${i}`), useValue: i }],
    children: [
      { path: 'users/:id', component: Page, data: { section: 'users' } },
      { path: 'settings', component: Page, data: { section: 'settings' } }
    ]
  });
}

const router = createRouter(routes);
const samples = [];

function median(values) {
  return values.slice().sort((a, b) => a - b)[Math.floor(values.length / 2)];
}

for (let run = 0; run < RUNS; run++) {
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    const area = i % ROUTES;
    const match = router.match(`/area-${area}/users/${i}`);
    if (!match || match.params.id !== String(i) || match.data.section !== 'users') throw new Error('router production benchmark mismatch');
  }
  samples.push(((performance.now() - start) * 1000) / ITERATIONS);
}

const medianUs = Number(median(samples).toFixed(3));
const gateUs = 25;

console.log(JSON.stringify({ routes: ROUTES, iterations: ITERATIONS, runs: RUNS, medianUs, samples: samples.map(sample => Number(sample.toFixed(3))), gateUs }, null, 2));

if (medianUs > gateUs) throw new Error(`Router production benchmark exceeded gate: ${medianUs}us`);

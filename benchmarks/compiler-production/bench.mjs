import { performance } from 'node:perf_hooks';
import { parseTemplateToAst } from '@ariana/compiler';

const ITERATIONS = Number(process.env.ITERATIONS ?? 50000);
const RUNS = Number(process.env.RUNS ?? 5);

const template = `
<section class="page">
  <h1>{{ title }}</h1>
  <button [disabled]="saving()" [class.active]="active()" (click)="save()">Save</button>
  @if (visible()) {
    <article>
      @for (row of rows(); track row.id) {
        <div class="row"><span>{{ row.name }}</span><strong>{{ row.value }}</strong></div>
      }
    </article>
  }
</section>
`;

function median(values) {
  return values.slice().sort((a, b) => a - b)[Math.floor(values.length / 2)];
}

const samples = [];
for (let run = 0; run < RUNS; run++) {
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    const result = parseTemplateToAst(template);
    if (result.diagnostics.length !== 0) throw new Error('unexpected compiler diagnostics');
    if (result.ast.children.length === 0) throw new Error('empty ast');
  }
  samples.push(((performance.now() - start) * 1000) / ITERATIONS);
}

const medianUs = Number(median(samples).toFixed(3));
const gateUs = 75;

console.log(JSON.stringify({ iterations: ITERATIONS, runs: RUNS, medianUs, samples: samples.map(sample => Number(sample.toFixed(3))), gateUs }, null, 2));

if (medianUs > gateUs) throw new Error(`Compiler production benchmark exceeded gate: ${medianUs}us`);

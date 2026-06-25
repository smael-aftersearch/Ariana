import { chromium } from 'playwright';

const ITERATIONS = Number(process.env.ITERATIONS ?? 5000);
const LIST_ROWS = Number(process.env.LIST_ROWS ?? 300);
const LIST_ITERATIONS = Number(process.env.LIST_ITERATIONS ?? 200);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.setContent(`<!doctype html><html><body><div id="app"></div></body></html>`);

const result = await page.evaluate(({ ITERATIONS, LIST_ROWS, LIST_ITERATIONS }) => {
  const app = document.getElementById('app');
  if (!app) throw new Error('missing app host');

  const counter = document.createTextNode('0');
  app.appendChild(counter);
  const counterStart = performance.now();
  for (let i = 0; i < ITERATIONS; i++) counter.nodeValue = String(i);
  const counterUs = ((performance.now() - counterStart) * 1000) / ITERATIONS;

  app.textContent = '';
  const ul = document.createElement('ul');
  const nodes = new Map();
  for (let i = 0; i < LIST_ROWS; i++) {
    const li = document.createElement('li');
    li.textContent = `Row ${i}: ${i}`;
    nodes.set(i, li);
    ul.appendChild(li);
  }
  app.appendChild(ul);

  const listStart = performance.now();
  for (let i = 0; i < LIST_ITERATIONS; i++) {
    const id = i % LIST_ROWS;
    const li = nodes.get(id);
    li.textContent = `Row ${id}: ${i}`;
  }
  const listUs = ((performance.now() - listStart) * 1000) / LIST_ITERATIONS;

  return {
    counterUs: Number(counterUs.toFixed(3)),
    listUs: Number(listUs.toFixed(3)),
    iterations: ITERATIONS,
    listRows: LIST_ROWS,
    listIterations: LIST_ITERATIONS
  };
}, { ITERATIONS, LIST_ROWS, LIST_ITERATIONS });

await browser.close();

const gates = {
  counterUs: 50,
  listUs: 250
};

console.log(JSON.stringify({ result, gates }, null, 2));

if (result.counterUs > gates.counterUs) throw new Error(`Counter browser benchmark exceeded gate: ${result.counterUs}us`);
if (result.listUs > gates.listUs) throw new Error(`List browser benchmark exceeded gate: ${result.listUs}us`);

import { JSDOM } from 'jsdom';
import { performance } from 'node:perf_hooks';

const ROWS = Number(process.env.ROWS ?? 300);
const ITERATIONS = Number(process.env.ITERATIONS ?? 30);
const WARMUP = Number(process.env.WARMUP ?? 10);
const RUNS = Number(process.env.RUNS ?? 3);

const dom = new JSDOM('<!doctype html><html><head></head><body><div id="app"></div></body></html>', {
  pretendToBeVisual: true,
  url: 'http://localhost/'
});

Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  Node: dom.window.Node,
  Element: dom.window.Element,
  HTMLElement: dom.window.HTMLElement,
  Text: dom.window.Text,
  DocumentFragment: dom.window.DocumentFragment,
  Event: dom.window.Event,
  MutationObserver: dom.window.MutationObserver,
  requestAnimationFrame: cb => setTimeout(() => cb(performance.now()), 0),
  cancelAnimationFrame: id => clearTimeout(id)
});

const { bootstrap, Component, signal, effect, listSignal } = await import('@ariana/core');
const { compileTemplateToRender } = await import('../../packages/vite-plugin/dist/compiler.js');

function createRows(count = ROWS) {
  return Array.from({ length: count }, (_, index) => ({ id: index, name: `User ${index}`, active: index === 0 }));
}

function updateOne(row, index) {
  return { ...row, name: `User ${index} updated`, active: !row.active };
}

function resetDom() {
  document.head.innerHTML = '';
  document.body.innerHTML = '<div id="app"></div>';
  return document.getElementById('app');
}

function compileListRender() {
  const template = `<ul>@for (row of rows(); track row.id) { <li [class.active]="row.active">{{ row.name }}</li> }</ul>`;
  const compiled = compileTemplateToRender(template);
  if (!('renderCode' in compiled)) throw new Error(compiled.reason);
  return new Function('__ari_effect', '__ari_signal', `${compiled.renderCode}; return __ari_render;`)(effect, signal);
}

const render = compileListRender();

async function measure(operation, name, mount, mutate, expectedRows) {
  const values = [];
  const details = [];

  for (let run = 0; run < RUNS; run++) {
    const host = resetDom();
    const api = await mount(host);

    for (let i = 0; i < WARMUP; i++) await mutate(api, operation, i, true);

    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) await mutate(api, operation, i, false);
    const elapsed = performance.now() - start;

    values.push((elapsed * 1000) / ITERATIONS);
    details.push({ rows: document.querySelectorAll('li').length });
    await api.cleanup?.();
  }

  values.sort((a, b) => a - b);
  const median = values[Math.floor(values.length / 2)];

  return {
    operation,
    strategy: name,
    medianUs: Number(median.toFixed(3)),
    runs: values.map(value => Number(value.toFixed(3))).join(', '),
    rows: details[Math.floor(details.length / 2)].rows,
    expectedRows
  };
}

function mountVanilla(host) {
  const ul = document.createElement('ul');
  const records = new Map();
  const rows = createRows();

  for (const row of rows) {
    const li = document.createElement('li');
    li.textContent = row.name;
    li.classList.toggle('active', row.active);
    ul.appendChild(li);
    records.set(row.id, { li, row });
  }

  host.appendChild(ul);
  return { ul, records, rows, nextId: ROWS };
}

function mutateVanilla(api, operation, i) {
  if (operation === 'update') {
    const key = i % ROWS;
    const record = api.records.get(key);
    const next = updateOne(record.row, key);
    record.row = next;
    record.li.textContent = next.name;
    record.li.classList.toggle('active', next.active);
    return;
  }

  if (operation === 'insert') {
    const row = { id: api.nextId++, name: `Inserted ${api.nextId}`, active: false };
    const li = document.createElement('li');
    li.textContent = row.name;
    const index = Math.floor(api.rows.length / 2);
    api.ul.insertBefore(li, api.ul.children[index] ?? null);
    api.rows.splice(index, 0, row);
    api.records.set(row.id, { li, row });
    return;
  }

  if (operation === 'remove') {
    const record = api.records.get(i);
    if (!record) return;
    record.li.remove();
    api.records.delete(i);
  }
}

function mountArianaListSignal(host) {
  class ListComponent {
    rows = listSignal(createRows(), row => row.id);
    nextId = ROWS;
    update(index) {
      this.rows.updateByKey(index % ROWS, row => updateOne(row, index));
    }
    insert() {
      const id = this.nextId++;
      this.rows.insert({ id, name: `Inserted ${id}`, active: false }, Math.floor(this.rows.peek().length / 2));
    }
    remove(index) {
      this.rows.removeByKey(index);
    }
  }

  Component({ selector: 'ari-list-signal-ops', render })(ListComponent);
  return { instance: bootstrap(ListComponent, host) };
}

function mutateArianaListSignal(api, operation, i) {
  if (operation === 'update') api.instance.update(i);
  if (operation === 'insert') api.instance.insert();
  if (operation === 'remove') api.instance.remove(i);
}

function mountArianaSignal(host) {
  class ListComponent {
    rows = signal(createRows());
    nextId = ROWS;
    update(index) {
      this.rows.update(rows => rows.map(row => row.id === index % ROWS ? updateOne(row, index) : row));
    }
    insert() {
      const id = this.nextId++;
      this.rows.update(rows => {
        const next = rows.slice();
        next.splice(Math.floor(next.length / 2), 0, { id, name: `Inserted ${id}`, active: false });
        return next;
      });
    }
    remove(index) {
      this.rows.update(rows => rows.filter(row => row.id !== index));
    }
  }

  Component({ selector: 'ari-list-signal-ops-fallback', render })(ListComponent);
  return { instance: bootstrap(ListComponent, host) };
}

function mutateArianaSignal(api, operation, i) {
  if (operation === 'update') api.instance.update(i);
  if (operation === 'insert') api.instance.insert();
  if (operation === 'remove') api.instance.remove(i);
}

const operations = [
  { name: 'update', expectedRows: ROWS },
  { name: 'insert', expectedRows: ROWS + WARMUP + ITERATIONS },
  { name: 'remove', expectedRows: ROWS - Math.max(WARMUP, ITERATIONS) }
];

const rows = [];
for (const operation of operations) {
  rows.push(await measure(operation.name, 'Vanilla keyed DOM', mountVanilla, mutateVanilla, operation.expectedRows));
  rows.push(await measure(operation.name, 'Ariana @for + listSignal', mountArianaListSignal, mutateArianaListSignal, operation.expectedRows));
  rows.push(await measure(operation.name, 'Ariana @for + normal signal', mountArianaSignal, mutateArianaSignal, operation.expectedRows));
}

rows.sort((a, b) => a.operation.localeCompare(b.operation) || a.medianUs - b.medianUs);
console.table(rows);
console.log(JSON.stringify({ rows: ROWS, iterations: ITERATIONS, warmup: WARMUP, runs: RUNS, results: rows }, null, 2));

import { JSDOM } from 'jsdom';
import { performance } from 'node:perf_hooks';

const ROWS = Number(process.env.ROWS ?? 300);
const ITERATIONS = Number(process.env.ITERATIONS ?? 50);
const WARMUP = Number(process.env.WARMUP ?? 5);
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
  SVGElement: dom.window.SVGElement,
  Text: dom.window.Text,
  DocumentFragment: dom.window.DocumentFragment,
  NodeFilter: dom.window.NodeFilter,
  Event: dom.window.Event,
  MouseEvent: dom.window.MouseEvent,
  MutationObserver: dom.window.MutationObserver,
  requestAnimationFrame: cb => setTimeout(() => cb(performance.now()), 0),
  cancelAnimationFrame: id => clearTimeout(id)
});

await import('@angular/compiler');
const React = await import('react');
const { createRoot } = await import('react-dom/client');
const { flushSync } = await import('react-dom');
const { createApp, nextTick } = await import('vue');
const ng = await import('@angular/core');
const angularBrowser = await import('@angular/platform-browser');
const { bootstrap, Component, signal, effect } = await import('@ariana/core');
const { compileTemplateToRender } = await import('../../packages/vite-plugin/dist/compiler.js');

function createRows(count = ROWS) {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    name: `User ${index}`,
    active: index === 0
  }));
}

function updateOne(rows, index) {
  const next = rows.slice();
  const row = next[index];
  next[index] = {
    ...row,
    name: `User ${index} updated`,
    active: !row.active
  };
  return next;
}

function resetDom() {
  document.head.innerHTML = '';
  document.body.innerHTML = '<div id="app"></div>';
  return document.getElementById('app');
}

async function measure(name, mount, update, cleanup) {
  const host = resetDom();
  const mountStart = performance.now();
  const api = await mount(host);
  const mountMs = performance.now() - mountStart;

  for (let i = 0; i < WARMUP; i++) await update(api, i % ROWS);

  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) await update(api, i % ROWS);
  const updateMs = performance.now() - start;

  const result = {
    framework: name,
    mountMs,
    updateMs,
    avgUpdateUs: (updateMs * 1000) / ITERATIONS,
    rows: document.querySelectorAll('li').length,
    firstText: document.querySelector('li')?.textContent ?? ''
  };

  await cleanup?.(api);
  return result;
}

function benchVanillaKeyed() {
  return measure('Vanilla keyed DOM', host => {
    const ul = document.createElement('ul');
    const records = new Map();

    for (const row of createRows()) {
      const li = document.createElement('li');
      li.textContent = row.name;
      li.classList.toggle('active', row.active);
      ul.appendChild(li);
      records.set(row.id, { li, row });
    }

    host.appendChild(ul);
    return { records };
  }, (api, index) => {
    const record = api.records.get(index);
    const next = { ...record.row, name: `User ${index} updated`, active: !record.row.active };
    record.row = next;
    record.li.textContent = next.name;
    record.li.classList.toggle('active', next.active);
  });
}

function benchArianaKeyedFor() {
  const template = `
    <ul>
      @for (row of rows(); track row.id) {
        <li [class.active]="row.active">{{ row.name }}</li>
      }
    </ul>
  `;
  const compiled = compileTemplateToRender(template);
  if (!('renderCode' in compiled)) throw new Error(compiled.reason);
  const render = new Function('__ari_effect', '__ari_signal', `${compiled.renderCode}; return __ari_render;`)(effect, signal);

  class ListComponent {
    rows = signal(createRows());
    update(index) {
      this.rows.update(value => updateOne(value, index));
    }
  }

  Component({ selector: 'ari-list-bench', render })(ListComponent);

  return measure('Ariana keyed @for compiler', host => bootstrap(ListComponent, host), (api, index) => api.update(index));
}

function benchArianaRecreateFor() {
  class ListComponent {
    rows = signal(createRows());
    update(index) {
      this.rows.update(value => updateOne(value, index));
    }
  }

  Component({
    selector: 'ari-list-recreate-bench',
    render(ctx, host) {
      const ul = document.createElement('ul');
      host.appendChild(ul);
      return effect(() => {
        ul.replaceChildren();
        for (const row of ctx.rows()) {
          const li = document.createElement('li');
          li.textContent = row.name;
          li.classList.toggle('active', row.active);
          ul.appendChild(li);
        }
      });
    }
  })(ListComponent);

  return measure('Ariana recreate list', host => bootstrap(ListComponent, host), (api, index) => api.update(index));
}

function benchReact() {
  let setRowsRef;

  function List() {
    const [rows, setRows] = React.useState(createRows());
    setRowsRef = setRows;
    return React.createElement('ul', null, rows.map(row =>
      React.createElement('li', { key: row.id, className: row.active ? 'active' : '' }, row.name)
    ));
  }

  return measure('React keyed list flushSync', host => {
    const root = createRoot(host);
    flushSync(() => root.render(React.createElement(List)));
    return { root };
  }, (_api, index) => {
    flushSync(() => setRowsRef(rows => updateOne(rows, index)));
  }, api => api.root.unmount());
}

async function benchVue() {
  return measure('Vue keyed v-for nextTick', host => {
    const app = createApp({
      data: () => ({ rows: createRows() }),
      methods: {
        update(index) {
          this.rows = updateOne(this.rows, index);
        }
      },
      template: '<ul><li v-for="row in rows" :key="row.id" :class="{ active: row.active }">{{ row.name }}</li></ul>'
    });
    const vm = app.mount(host);
    return { app, vm };
  }, async (api, index) => {
    api.vm.update(index);
    await nextTick();
  }, api => api.app.unmount());
}

async function benchAngular() {
  class ListComponent {
    rows = ng.signal(createRows());
    update(index) {
      this.rows.update(value => updateOne(value, index));
    }
  }

  ng.Component({
    selector: 'ng-list-bench',
    template: '<ul>@for (row of rows(); track row.id) { <li [class.active]="row.active">{{ row.name }}</li> }</ul>'
  })(ListComponent);

  return measure('Angular @for signal + detectChanges', async host => {
    const app = await angularBrowser.createApplication({ providers: [] });
    const ref = ng.createComponent(ListComponent, { environmentInjector: app.injector, hostElement: host });
    app.injector.get(ng.ApplicationRef).attachView(ref.hostView);
    ref.changeDetectorRef.detectChanges();
    return { app, ref };
  }, async (api, index) => {
    api.ref.instance.update(index);
    api.ref.changeDetectorRef.detectChanges();
  }, async api => {
    api.ref.destroy();
    await api.app.destroy();
  });
}

async function runFramework(fn) {
  const values = [];
  for (let run = 0; run < RUNS; run++) values.push(await fn());
  values.sort((a, b) => a.avgUpdateUs - b.avgUpdateUs);
  return { median: values[Math.floor(values.length / 2)], values };
}

const results = [];
for (const framework of [benchVanillaKeyed, benchArianaKeyedFor, benchArianaRecreateFor, benchReact, benchVue, benchAngular]) {
  results.push(await runFramework(framework));
}

const table = results.map(result => ({
  framework: result.median.framework,
  mountMs: Number(result.median.mountMs.toFixed(3)),
  updateMs: Number(result.median.updateMs.toFixed(3)),
  avgUpdateUs: Number(result.median.avgUpdateUs.toFixed(3)),
  rows: result.median.rows,
  firstText: result.median.firstText,
  runs: result.values.map(value => Number(value.avgUpdateUs.toFixed(3))).join(', ')
})).sort((a, b) => a.avgUpdateUs - b.avgUpdateUs);

console.table(table);
console.log(JSON.stringify({ rows: ROWS, iterations: ITERATIONS, warmup: WARMUP, runs: RUNS, table }, null, 2));

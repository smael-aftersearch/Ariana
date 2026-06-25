import { JSDOM } from 'jsdom';
import { performance } from 'node:perf_hooks';

const ITERATIONS = Number(process.env.ITERATIONS ?? 5000);
const WARMUP = Number(process.env.WARMUP ?? 500);

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
const { createSignal, createEffect } = await import('./node_modules/solid-js/dist/solid.js');
const { render: solidRender } = await import('./node_modules/solid-js/web/dist/web.js');
const ng = await import('@angular/core');
const angularBrowser = await import('@angular/platform-browser');
const { bootstrap, Component, signal, effect } = await import('@ariana/core');

function resetDom() {
  document.head.innerHTML = '';
  document.body.innerHTML = '<div id="app"></div>';
  return document.getElementById('app');
}

function measure(name, mount, update, readText, cleanup) {
  const host = resetDom();
  const mountStart = performance.now();
  const api = mount(host);
  const mountMs = performance.now() - mountStart;

  for (let i = 1; i <= WARMUP; i++) update(api, i);

  const start = performance.now();
  for (let i = 1; i <= ITERATIONS; i++) update(api, i);
  const updateMs = performance.now() - start;

  const result = {
    framework: name,
    mountMs,
    updateMs,
    avgUpdateUs: (updateMs * 1000) / ITERATIONS,
    finalText: readText(api)
  };

  cleanup?.(api);
  return result;
}

async function measureAsync(name, mount, update, readText, cleanup) {
  const host = resetDom();
  const mountStart = performance.now();
  const api = await mount(host);
  const mountMs = performance.now() - mountStart;

  for (let i = 1; i <= WARMUP; i++) await update(api, i);

  const start = performance.now();
  for (let i = 1; i <= ITERATIONS; i++) await update(api, i);
  const updateMs = performance.now() - start;

  const result = {
    framework: name,
    mountMs,
    updateMs,
    avgUpdateUs: (updateMs * 1000) / ITERATIONS,
    finalText: readText(api)
  };

  await cleanup?.(api);
  return result;
}

function benchVanillaTextNode() {
  return measure('Vanilla TextNode', host => {
    const p = document.createElement('p');
    p.append('Count: ');
    const text = document.createTextNode('0');
    p.append(text);
    host.appendChild(p);
    return { p, text };
  }, (api, i) => {
    api.text.nodeValue = String(i);
  }, api => api.p.textContent);
}

function benchVanillaDom() {
  return measure('Vanilla DOM textContent', host => {
    const p = document.createElement('p');
    p.textContent = 'Count: 0';
    host.appendChild(p);
    return { p };
  }, (api, i) => {
    api.p.textContent = `Count: ${i}`;
  }, api => api.p.textContent);
}

function benchArianaRuntime() {
  class Counter {
    count = signal(0);
    setCount(value) { this.count.set(value); }
  }
  Component({ selector: 'ari-counter-runtime', template: '<p>Count: {{ count() }}</p>' })(Counter);

  return measure('Ariana v1 runtime', host => bootstrap(Counter, host), (api, i) => api.setCount(i), () => document.querySelector('p')?.textContent ?? '');
}

function benchArianaCompiledPreview() {
  class Counter {
    count = signal(0);
    setCount(value) { this.count.set(value); }
  }
  Component({
    selector: 'ari-counter-compiled',
    render(component, host) {
      const p = document.createElement('p');
      p.append('Count: ');
      const text = document.createTextNode('0');
      p.append(text);
      host.appendChild(p);
      return effect(() => { text.nodeValue = String(component.count()); });
    }
  })(Counter);

  return measure('Ariana v2 compiled preview', host => bootstrap(Counter, host), (api, i) => api.setCount(i), () => document.querySelector('p')?.textContent ?? '');
}

function benchSolid() {
  let setCountRef;
  let dispose;
  return measure('Solid signal', host => {
    const [count, setCount] = createSignal(0);
    setCountRef = setCount;
    dispose = solidRender(() => {
      const p = document.createElement('p');
      p.append('Count: ');
      const text = document.createTextNode('0');
      p.append(text);
      createEffect(() => { text.nodeValue = String(count()); });
      return p;
    }, host);
    return { host };
  }, (_api, i) => setCountRef(i), () => document.querySelector('p')?.textContent ?? '', () => dispose?.());
}

function benchReact() {
  let setCountRef;
  function Counter() {
    const [count, setCount] = React.useState(0);
    setCountRef = setCount;
    return React.createElement('p', null, `Count: ${count}`);
  }

  return measure('React flushSync', host => {
    const root = createRoot(host);
    flushSync(() => root.render(React.createElement(Counter)));
    return { root };
  }, (_api, i) => flushSync(() => setCountRef(i)), () => document.querySelector('p')?.textContent ?? '', api => api.root.unmount());
}

async function benchVue() {
  return measureAsync('Vue nextTick', host => {
    const app = createApp({ data: () => ({ count: 0 }), template: '<p>Count: {{ count }}</p>' });
    const vm = app.mount(host);
    return { app, vm };
  }, async (api, i) => {
    api.vm.count = i;
    await nextTick();
  }, () => document.querySelector('p')?.textContent ?? '', api => api.app.unmount());
}

async function benchAngular() {
  class Counter {
    count = ng.signal(0);
    setCount(value) { this.count.set(value); }
  }
  ng.Component({ selector: 'ng-counter', template: '<p>Count: {{ count() }}</p>' })(Counter);

  return measureAsync('Angular signal + detectChanges', async host => {
    const app = await angularBrowser.createApplication({ providers: [] });
    const ref = ng.createComponent(Counter, { environmentInjector: app.injector, hostElement: host });
    app.injector.get(ng.ApplicationRef).attachView(ref.hostView);
    ref.changeDetectorRef.detectChanges();
    return { app, ref };
  }, async (api, i) => {
    api.ref.instance.setCount(i);
    api.ref.changeDetectorRef.detectChanges();
  }, () => document.querySelector('p')?.textContent ?? '', async api => {
    api.ref.destroy();
    await api.app.destroy();
  });
}

const results = [
  benchVanillaTextNode(),
  benchSolid(),
  benchArianaCompiledPreview(),
  benchArianaRuntime(),
  benchVanillaDom(),
  await benchVue(),
  benchReact(),
  await benchAngular()
];

for (const result of results) {
  if (!result.finalText.includes(String(ITERATIONS))) {
    result.warning = `Final text did not include ${ITERATIONS}: ${result.finalText}`;
  }
}

const table = results.map(r => ({
  framework: r.framework,
  mountMs: Number(r.mountMs.toFixed(3)),
  updateMs: Number(r.updateMs.toFixed(3)),
  avgUpdateUs: Number(r.avgUpdateUs.toFixed(3)),
  finalText: r.finalText,
  warning: r.warning ?? ''
})).sort((a, b) => a.avgUpdateUs - b.avgUpdateUs);

console.table(table);
console.log(JSON.stringify({ iterations: ITERATIONS, warmup: WARMUP, table, raw: results }, null, 2));

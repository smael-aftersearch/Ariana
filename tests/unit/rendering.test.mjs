import {
  activateIslands,
  cleanupIslands,
  defineIsland,
  generateStaticRoutePages,
  islandScript,
  parseIslandManifest,
  renderIslandPlaceholder,
  renderToString,
  routePathToFilePath
} from '../../packages/rendering/dist/index.js';
import { test, assert, equal } from './test-runner.mjs';

class MiniElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.attributes = new Map();
    this.textContent = '';
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name); }
}

class MiniRoot {
  constructor(nodes) { this.nodes = nodes; }
  querySelector(selector) {
    if (selector === 'script[data-ariana-islands]') return this.nodes.find(node => node.tagName === 'script' && node.attributes.has('data-ariana-islands'));
    const match = selector.match(/^\[data-ariana-island="(.*)"\]$/);
    if (match) return this.nodes.find(node => node.attributes.get('data-ariana-island') === match[1]);
    return undefined;
  }
}

test('rendering: renderToString injects title and body', () => {
  const html = renderToString('<main>Ariana</main>', { title: 'Hello <Ariana>' });
  assert(html.includes('<main>Ariana</main>'));
  assert(html.includes('Hello &lt;Ariana&gt;'));
});

test('rendering: island manifest and placeholder are generated safely', () => {
  const island = defineIsland('counter', 'CounterIsland', { count: 1 });
  const placeholder = renderIslandPlaceholder(island);
  const script = islandScript([island]);
  assert(placeholder.includes('data-ariana-island="counter"'));
  assert(script.includes('data-ariana-islands'));
  assert(script.includes('CounterIsland'));
});

test('rendering: parseIslandManifest reads valid island definitions', () => {
  const script = new MiniElement('script');
  script.setAttribute('data-ariana-islands', '');
  script.textContent = JSON.stringify([defineIsland('one', 'One', { ok: true })]);
  const root = new MiniRoot([script]);
  const islands = parseIslandManifest(root);
  equal(islands.length, 1);
  equal(islands[0].id, 'one');
});

test('rendering: activateIslands hydrates targets and cleanup runs', () => {
  const script = new MiniElement('script');
  script.setAttribute('data-ariana-islands', '');
  script.textContent = JSON.stringify([defineIsland('one', 'One', { name: 'Ariana' })]);
  const target = new MiniElement('div');
  target.setAttribute('data-ariana-island', 'one');
  const root = new MiniRoot([script, target]);
  let cleaned = false;

  const result = activateIslands({
    One(element, props) {
      element.setAttribute('data-name', props.name);
      return () => { cleaned = true; };
    }
  }, root);

  equal(result.activated, 1);
  equal(result.missing.length, 0);
  equal(target.getAttribute('data-ariana-hydrated'), 'true');
  equal(target.getAttribute('data-name'), 'Ariana');
  cleanupIslands(result);
  equal(cleaned, true);
});

test('rendering: route paths map to static file paths', () => {
  equal(routePathToFilePath('/'), 'index.html');
  equal(routePathToFilePath('/admin/users'), 'admin/users/index.html');
  equal(routePathToFilePath('settings/'), 'settings/index.html');
});

test('rendering: generateStaticRoutePages includes filePath', () => {
  const pages = generateStaticRoutePages(['/', '/admin'], path => renderToString(`<main>${path}</main>`));
  equal(pages.length, 2);
  equal(pages[0].filePath, 'index.html');
  equal(pages[1].filePath, 'admin/index.html');
});

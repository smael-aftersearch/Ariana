import {
  defineIsland,
  generateStaticRoutePages,
  islandScript,
  renderIslandPlaceholder,
  renderToString,
  routePathToFilePath
} from '../../packages/rendering/dist/index.js';
import { test, assert, equal } from './test-api.mjs';

test('rendering: renderToString injects title and body', () => {
  const html = renderToString('<main>Ariana</main>', { title: 'Hello <Ariana>' });
  assert(html.includes('<main>Ariana</main>'));
  assert(html.includes('Hello &lt;Ariana&gt;'));
});

test('rendering: island manifest and placeholder are generated safely', () => {
  const island = defineIsland('counter', 'CounterIsland', { count: 1 });
  const placeholder = renderIslandPlaceholder(island);
  const script = islandScript([island]);
  assert(placeholder.includes('data-ariana-island'));
  assert(script.includes('data-ariana-islands'));
  assert(script.includes('CounterIsland'));
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

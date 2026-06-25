export type RenderToStringOptions = { shell?: string; title?: string };
export type IslandDefinition<Props = unknown> = { id: string; component: string; props?: Props };
export type StaticPage = { path: string; html: string };

export function renderToString(body: string, options: RenderToStringOptions = {}): string {
  const title = escapeHtml(options.title ?? 'Ariana App');
  const shell = options.shell ?? '<!doctype html><html><head><title>{{title}}</title></head><body><div id="app">{{body}}</div></body></html>';
  return shell.replace('{{title}}', title).replace('{{body}}', body);
}

export function defineIsland<Props>(id: string, component: string, props?: Props): IslandDefinition<Props> {
  return { id, component, props };
}

export function islandScript(islands: readonly IslandDefinition[]): string {
  const payload = JSON.stringify(islands).replace(/</g, '\\u003c');
  return `<script type="application/json" data-ariana-islands>${payload}</script>`;
}

export function renderIslandPlaceholder(island: IslandDefinition): string {
  return `<div data-ariana-island="${escapeAttribute(island.id)}"></div>`;
}

export function generateStaticPages(routes: readonly string[], render: (path: string) => string): StaticPage[] {
  return routes.map(path => ({ path, html: render(path) }));
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char);
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

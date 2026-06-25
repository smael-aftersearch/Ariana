export type RenderToStringOptions = { shell?: string; title?: string };
export type IslandDefinition<Props = unknown> = { id: string; component: string; props?: Props };
export type StaticPage = { path: string; html: string };
export type StaticRoutePage = StaticPage & { filePath: string };

export type IslandHydrator<Props = unknown> = (target: Element, props: Props | undefined) => void | (() => void);
export type IslandRegistry = Record<string, IslandHydrator>;
export type IslandActivationResult = {
  activated: number;
  missing: IslandDefinition[];
  cleanups: Array<() => void>;
};

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

export function parseIslandManifest(root: ParentNode = document): IslandDefinition[] {
  const script = root.querySelector('script[data-ariana-islands]');
  if (!script?.textContent?.trim()) return [];
  const parsed = JSON.parse(script.textContent) as unknown;
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isIslandDefinition);
}

export function activateIslands(registry: IslandRegistry, root: ParentNode = document): IslandActivationResult {
  const islands = parseIslandManifest(root);
  const missing: IslandDefinition[] = [];
  const cleanups: Array<() => void> = [];
  let activated = 0;

  for (const island of islands) {
    const target = root.querySelector(`[data-ariana-island="${cssEscape(island.id)}"]`);
    const hydrate = registry[island.component];

    if (!target || !hydrate) {
      missing.push(island);
      continue;
    }

    const cleanup = hydrate(target, island.props);
    target.setAttribute('data-ariana-hydrated', 'true');
    activated++;
    if (typeof cleanup === 'function') cleanups.push(cleanup);
  }

  return { activated, missing, cleanups };
}

export function cleanupIslands(result: IslandActivationResult): void {
  for (const cleanup of result.cleanups.splice(0)) cleanup();
}

export function generateStaticPages(routes: readonly string[], render: (path: string) => string): StaticPage[] {
  return routes.map(path => ({ path, html: render(path) }));
}

export function generateStaticRoutePages(routes: readonly string[], render: (path: string) => string): StaticRoutePage[] {
  return routes.map(path => ({ path, filePath: routePathToFilePath(path), html: render(path) }));
}

export function routePathToFilePath(path: string): string {
  const normalized = normalizeRoutePath(path);
  if (normalized === '/') return 'index.html';
  return `${normalized.slice(1)}/index.html`;
}

function normalizeRoutePath(path: string): string {
  const trimmed = path.trim() || '/';
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withSlash.length > 1 && withSlash.endsWith('/') ? withSlash.slice(0, -1) : withSlash;
}

function isIslandDefinition(value: unknown): value is IslandDefinition {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === 'string' && typeof candidate.component === 'string';
}

function cssEscape(value: string): string {
  const css = globalThis.CSS as { escape?: (value: string) => string } | undefined;
  return css?.escape ? css.escape(value) : value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char);
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

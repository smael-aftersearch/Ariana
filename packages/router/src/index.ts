import { signal } from '@ariana/core';
import type { Provider } from '@ariana/core';

export type RouteData = Record<string, unknown>;
export type RouteGuard = (context: RouteContext) => boolean | string | Promise<boolean | string>;

export type RouteDefinition<TComponent = unknown> = {
  path: string;
  component: new (...args: never[]) => TComponent;
  title?: string;
  data?: RouteData;
  providers?: readonly Provider[];
  guards?: readonly RouteGuard[];
  children?: readonly RouteDefinition[];
};

export type RouteMatch = {
  route: RouteDefinition;
  path: string;
  params: Record<string, string>;
  data: RouteData;
  providers: readonly Provider[];
  guardChain: readonly RouteGuard[];
};

export type RouteContext = {
  path: string;
  params: Record<string, string>;
  data: RouteData;
  providers: readonly Provider[];
  match?: RouteMatch;
};

export type RouterOptions = {
  maxRedirects?: number;
};

export type Router = {
  readonly currentPath: ReturnType<typeof signal<string>>;
  readonly currentMatch: ReturnType<typeof signal<RouteMatch | undefined>>;
  readonly currentData: ReturnType<typeof signal<RouteData>>;
  readonly currentProviders: ReturnType<typeof signal<readonly Provider[]>>;
  navigate(path: string): Promise<boolean>;
  match(path: string): RouteMatch | undefined;
  link(path: string): string;
};

type CompiledRoute = {
  route: RouteDefinition;
  parts: string[];
  paramNames: Array<string | undefined>;
  data: RouteData;
  providers: readonly Provider[];
  guardChain: readonly RouteGuard[];
};

export function createRouter(routes: readonly RouteDefinition[], initialPath = '/', options: RouterOptions = {}): Router {
  const compiledRoutes = compileRoutes(routes);
  const matchPath = (path: string) => matchCompiledRoutes(compiledRoutes, path);
  const initialMatch = matchPath(initialPath);
  const currentPath = signal(initialPath);
  const currentMatch = signal<RouteMatch | undefined>(initialMatch);
  const currentData = signal<RouteData>(initialMatch?.data ?? {});
  const currentProviders = signal<readonly Provider[]>(initialMatch?.providers ?? []);
  const maxRedirects = options.maxRedirects ?? 10;

  async function navigatePath(path: string, redirectCount: number): Promise<boolean> {
    if (redirectCount > maxRedirects) return false;

    const match = matchPath(path);

    if (!match) {
      currentPath.set(normalizePath(path));
      currentMatch.set(undefined);
      currentData.set({});
      currentProviders.set([]);
      return false;
    }

    const context: RouteContext = { path: match.path, params: match.params, data: match.data, providers: match.providers, match };

    for (const guard of match.guardChain) {
      const result = await guard(context);
      if (typeof result === 'string') return navigatePath(result, redirectCount + 1);
      if (result === false) return false;
    }

    currentPath.set(match.path);
    currentMatch.set(match);
    currentData.set(match.data);
    currentProviders.set(match.providers);
    return true;
  }

  return {
    currentPath,
    currentMatch,
    currentData,
    currentProviders,
    navigate(path: string) { return navigatePath(path, 0); },
    match: matchPath,
    link(path: string) { return normalizePath(path); }
  };
}

export function matchRoutes(routes: readonly RouteDefinition[], path: string): RouteMatch | undefined {
  return matchCompiledRoutes(compileRoutes(routes), path);
}

function compileRoutes(
  routes: readonly RouteDefinition[],
  parentPath = '',
  parentData: RouteData = {},
  parentProviders: readonly Provider[] = [],
  parentGuards: readonly RouteGuard[] = []
): CompiledRoute[] {
  const result: CompiledRoute[] = [];

  for (const route of routes) {
    const path = joinPaths(parentPath, route.path);
    const data = { ...parentData, ...(route.data ?? {}) };
    const providers = [...parentProviders, ...(route.providers ?? [])];
    const guardChain = [...parentGuards, ...(route.guards ?? [])];
    const normalizedRoute = { ...route, path, data, providers, guards: route.guards ?? [] };
    const parts = splitPath(path);

    result.push({
      route: normalizedRoute,
      parts,
      paramNames: parts.map(part => part.startsWith(':') ? part.slice(1) : undefined),
      data,
      providers,
      guardChain
    });

    if (route.children) result.push(...compileRoutes(route.children, path, data, providers, guardChain));
  }

  return result;
}

function matchCompiledRoutes(routes: readonly CompiledRoute[], path: string): RouteMatch | undefined {
  const normalizedPath = normalizePath(path);
  const pathParts = splitPath(normalizedPath);

  for (const compiled of routes) {
    if (compiled.parts.length !== pathParts.length) continue;
    const params: Record<string, string> = {};
    let matched = true;

    for (let i = 0; i < compiled.parts.length; i++) {
      const paramName = compiled.paramNames[i];
      const expected = compiled.parts[i];
      const actual = pathParts[i];

      if (paramName) {
        params[paramName] = decodeURIComponent(actual);
        continue;
      }

      if (expected !== actual) {
        matched = false;
        break;
      }
    }

    if (matched) return {
      route: compiled.route,
      path: normalizedPath,
      params,
      data: compiled.data,
      providers: compiled.providers,
      guardChain: compiled.guardChain
    };
  }

  return undefined;
}

function normalizePath(path: string): string {
  const normalized = path.trim() || '/';
  const withoutHash = normalized.split('#')[0] ?? '/';
  const withoutQuery = withoutHash.split('?')[0] ?? '/';
  return withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
}

function splitPath(path: string): string[] {
  return normalizePath(path).split('/').filter(Boolean);
}

function joinPaths(left: string, right: string): string {
  const leftPart = left.endsWith('/') ? left.slice(0, -1) : left;
  const rightPart = right.startsWith('/') ? right : `/${right}`;
  return normalizePath(`${leftPart}${rightPart}`);
}

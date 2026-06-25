import { signal } from '@ariana/core';

export type RouteGuard = (context: RouteContext) => boolean | string | Promise<boolean | string>;

export type RouteDefinition<TComponent = unknown> = {
  path: string;
  component: new (...args: never[]) => TComponent;
  title?: string;
  guards?: readonly RouteGuard[];
  children?: readonly RouteDefinition[];
};

export type RouteMatch = {
  route: RouteDefinition;
  path: string;
  params: Record<string, string>;
};

export type RouteContext = {
  path: string;
  params: Record<string, string>;
  match?: RouteMatch;
};

export type Router = {
  readonly currentPath: ReturnType<typeof signal<string>>;
  readonly currentMatch: ReturnType<typeof signal<RouteMatch | undefined>>;
  navigate(path: string): Promise<boolean>;
  match(path: string): RouteMatch | undefined;
  link(path: string): string;
};

type CompiledRoute = {
  route: RouteDefinition;
  parts: string[];
  paramNames: Array<string | undefined>;
};

export function createRouter(routes: readonly RouteDefinition[], initialPath = '/'): Router {
  const compiledRoutes = compileRoutes(routes);
  const matchPath = (path: string) => matchCompiledRoutes(compiledRoutes, path);
  const currentPath = signal(initialPath);
  const currentMatch = signal<RouteMatch | undefined>(matchPath(initialPath));

  return {
    currentPath,
    currentMatch,
    async navigate(path: string) {
      const match = matchPath(path);

      if (!match) {
        currentPath.set(path);
        currentMatch.set(undefined);
        return false;
      }

      for (const guard of match.route.guards ?? []) {
        const result = await guard({ path, params: match.params, match });
        if (typeof result === 'string') return this.navigate(result);
        if (result === false) return false;
      }

      currentPath.set(path);
      currentMatch.set(match);
      return true;
    },
    match: matchPath,
    link(path: string) {
      return path.startsWith('/') ? path : `/${path}`;
    }
  };
}

export function matchRoutes(routes: readonly RouteDefinition[], path: string): RouteMatch | undefined {
  return matchCompiledRoutes(compileRoutes(routes), path);
}

function compileRoutes(routes: readonly RouteDefinition[], parentPath = ''): CompiledRoute[] {
  const result: CompiledRoute[] = [];

  for (const route of routes) {
    const path = joinPaths(parentPath, route.path);
    const normalizedRoute = { ...route, path };
    const parts = splitPath(path);
    result.push({ route: normalizedRoute, parts, paramNames: parts.map(part => part.startsWith(':') ? part.slice(1) : undefined) });

    if (route.children) result.push(...compileRoutes(route.children, path));
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

    if (matched) return { route: compiled.route, path: normalizedPath, params };
  }

  return undefined;
}

function normalizePath(path: string): string {
  const normalized = path.trim() || '/';
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

function splitPath(path: string): string[] {
  return normalizePath(path).split('/').filter(Boolean);
}

function joinPaths(left: string, right: string): string {
  const leftPart = left.endsWith('/') ? left.slice(0, -1) : left;
  const rightPart = right.startsWith('/') ? right : `/${right}`;
  return normalizePath(`${leftPart}${rightPart}`);
}

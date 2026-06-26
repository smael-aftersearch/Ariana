import { signal } from '@ariana-framework/core';
import type { Provider } from '@ariana-framework/core';

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
  match(path: string): RouteMatch | undefined;
  navigate(path: string): Promise<boolean>;
  link(path: string): string;
  currentData(): RouteData;
  currentProviders(): readonly Provider[];
};

export function createRouter(routes: readonly RouteDefinition[], initialPath = '/', options: RouterOptions = {}): Router {
  const currentPath = signal(initialPath);
  const currentMatch = signal<RouteMatch | undefined>(matchRoutes(routes, initialPath));
  const maxRedirects = options.maxRedirects ?? 8;

  async function navigate(path: string): Promise<boolean> {
    let targetPath = normalizePath(path);
    let redirects = 0;

    while (redirects <= maxRedirects) {
      const match = matchRoutes(routes, targetPath);
      if (!match) return false;
      const guardResult = await runGuards(match.guardChain, { path: targetPath, params: match.params, data: match.data, providers: match.providers, match });

      if (guardResult === true) {
        currentPath.set(targetPath);
        currentMatch.set(match);
        return true;
      }

      if (guardResult === false) return false;

      targetPath = normalizePath(guardResult);
      redirects++;
    }

    return false;
  }

  return {
    currentPath,
    currentMatch,
    match(path: string) { return matchRoutes(routes, path); },
    navigate,
    link(path: string) { return normalizePath(path); },
    currentData() { return currentMatch()?.data ?? {}; },
    currentProviders() { return currentMatch()?.providers ?? []; }
  };
}

export function matchRoutes(routes: readonly RouteDefinition[], path: string): RouteMatch | undefined {
  const cleanPath = normalizePath(path);
  for (const route of routes) {
    const match = matchRouteBranch(route, cleanPath, '', {}, {}, [], []);
    if (match) return match;
  }
  return undefined;
}

function matchRouteBranch(route: RouteDefinition, path: string, basePath: string, inheritedParams: Record<string, string>, inheritedData: RouteData, inheritedProviders: readonly Provider[], inheritedGuards: readonly RouteGuard[]): RouteMatch | undefined {
  const routePath = joinPaths(basePath, route.path);
  const routeMatch = matchPath(routePath, path);
  const data = { ...inheritedData, ...(route.data ?? {}) };
  const providers = [...inheritedProviders, ...(route.providers ?? [])];
  const guardChain = [...inheritedGuards, ...(route.guards ?? [])];

  if (routeMatch) {
    return { route, path, params: { ...inheritedParams, ...routeMatch }, data, providers, guardChain };
  }

  for (const child of route.children ?? []) {
    const childMatch = matchRouteBranch(child, path, routePath, inheritedParams, data, providers, guardChain);
    if (childMatch) return childMatch;
  }

  return undefined;
}

function matchPath(pattern: string, path: string): Record<string, string> | undefined {
  const patternParts = splitPath(pattern);
  const pathParts = splitPath(path);
  if (patternParts.length !== pathParts.length) return undefined;
  const params: Record<string, string> = {};
  for (let index = 0; index < patternParts.length; index++) {
    const patternPart = patternParts[index];
    const pathPart = pathParts[index];
    if (patternPart.startsWith(':')) params[patternPart.slice(1)] = decodeURIComponent(pathPart);
    else if (patternPart !== pathPart) return undefined;
  }
  return params;
}

async function runGuards(guards: readonly RouteGuard[], context: RouteContext): Promise<boolean | string> {
  for (const guard of guards) {
    const result = await guard(context);
    if (result !== true) return result;
  }
  return true;
}

function normalizePath(path: string): string {
  const clean = path.split('?')[0].split('#')[0];
  if (!clean || clean === '/') return '/';
  return `/${clean.replace(/^\/+|\/+$/g, '')}`;
}

function splitPath(path: string): string[] {
  return normalizePath(path).split('/').filter(Boolean);
}

function joinPaths(basePath: string, routePath: string): string {
  if (routePath === '/') return '/';
  return normalizePath(`${basePath}/${routePath}`);
}

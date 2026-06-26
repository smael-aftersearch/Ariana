import type { RouteDefinition } from './index.js';

export type LazyRouteDefinition<TComponent = unknown> = Omit<RouteDefinition<TComponent>, 'component' | 'children'> & {
  loadComponent: () => Promise<new (...args: never[]) => TComponent>;
  children?: readonly LazyRouteDefinition[];
};

export async function resolveLazyRoute<TComponent>(route: LazyRouteDefinition<TComponent>): Promise<RouteDefinition<TComponent>> {
  const component = await route.loadComponent();
  const children = route.children ? await Promise.all(route.children.map(child => resolveLazyRoute(child))) : undefined;
  return {
    path: route.path,
    component,
    title: route.title,
    data: route.data,
    providers: route.providers,
    guards: route.guards,
    children
  };
}

export async function resolveLazyRoutes(routes: readonly LazyRouteDefinition[]): Promise<RouteDefinition[]> {
  return Promise.all(routes.map(route => resolveLazyRoute(route)));
}

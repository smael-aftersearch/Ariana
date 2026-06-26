import { createRouter } from './index.js';
import type { Router, RouterOptions } from './index.js';
import { resolveLazyRoutes } from './lazy.js';
import type { LazyRouteDefinition } from './lazy.js';

export async function createLazyRouter(
  routes: readonly LazyRouteDefinition[],
  initialPath = '/',
  options: RouterOptions = {}
): Promise<Router> {
  const resolvedRoutes = await resolveLazyRoutes(routes);
  return createRouter(resolvedRoutes, initialPath, options);
}

import { readFileSync } from 'node:fs';

const files = {
  coreBootstrap: readFileSync('packages/core/src/component/bootstrap.ts', 'utf8'),
  coreIndex: readFileSync('packages/core/src/component/index.ts', 'utf8'),
  router: readFileSync('packages/router/src/index.ts', 'utf8'),
  lazy: readFileSync('packages/router/src/lazy.ts', 'utf8'),
  transitions: readFileSync('packages/router/src/transitions.ts', 'utf8'),
  outlet: readFileSync('packages/router/src/outlet.ts', 'utf8'),
  routes: readFileSync('examples/admin-panel/src/app.routes.ts', 'utf8'),
  admin: readFileSync('examples/admin-panel/src/admin-panel.page.ts', 'utf8'),
  styles: readFileSync('examples/admin-panel/src/admin-animations.scss', 'utf8'),
  outletDemo: readFileSync('examples/admin-panel/src/route-outlet-demo.page.ts', 'utf8'),
  main: readFileSync('examples/admin-panel/src/main.ts', 'utf8')
};

const checks = [
  ['core mount helper', 'mountComponent', files.coreIndex],
  ['core destroy option', 'clearHostOnDestroy', files.coreBootstrap],
  ['route metadata', 'transition?: RouteTransition', files.router],
  ['current transition API', 'currentTransition()', files.router],
  ['outlet export', 'createRouterOutlet', files.router],
  ['lazy transition metadata', 'transition: route.transition', files.lazy],
  ['class validation', 'Invalid Ariana route transition class name', files.transitions],
  ['computed duration', 'getComputedStyle(element)', files.transitions],
  ['bounded fallback', '5000', files.transitions],
  ['outlet component mount', 'mountComponent', files.outlet],
  ['outlet enter helper', 'applyRouteEnter', files.outlet],
  ['outlet leave helper', 'runRouteLeave', files.outlet],
  ['admin route metadata', 'adminRouteTransition', files.routes],
  ['admin preserves metadata', 'transition: route.transition', files.admin],
  ['admin enter css', '.admin-route-enter', files.styles],
  ['admin leave css', '.admin-route-leave', files.styles],
  ['demo uses outlet', 'createRouterOutlet', files.outletDemo],
  ['demo route exposed', '/route-outlet', files.main]
];

for (const [label, fragment, source] of checks) {
  if (!source.includes(fragment)) throw new Error(`Router transition check failed: ${label}`);
}

console.log('Router transition check passed.');

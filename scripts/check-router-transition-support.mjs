import { readFileSync } from 'node:fs';

const router = readFileSync('packages/router/src/index.ts', 'utf8');
const lazy = readFileSync('packages/router/src/lazy.ts', 'utf8');
const transitions = readFileSync('packages/router/src/transitions.ts', 'utf8');
const routes = readFileSync('examples/admin-panel/src/app.routes.ts', 'utf8');
const admin = readFileSync('examples/admin-panel/src/admin-panel.page.ts', 'utf8');
const styles = readFileSync('examples/admin-panel/src/admin-animations.scss', 'utf8');

const checks = [
  ['route type has transition metadata', 'transition?: RouteTransition', router],
  ['route match exposes transition', 'transition?: RouteTransition', router],
  ['router exposes currentTransition', 'currentTransition()', router],
  ['router exports transition helpers', 'replaceWithRouteTransition', router],
  ['lazy routes preserve transition metadata', 'transition: route.transition', lazy],
  ['transition helper validates class names', 'Invalid Ariana route transition class name', transitions],
  ['transition helper uses computed style', 'getComputedStyle(element)', transitions],
  ['transition helper has bounded fallback', 'Math.min(Math.max(readMotionDurationMs(element) + 80, 120), 5000)', transitions],
  ['admin routes define transition metadata', 'transition: adminRouteTransition', routes],
  ['admin router preserves transition metadata', 'transition: route.transition', admin],
  ['admin route enter class exists', '.admin-route-enter', styles],
  ['admin route leave class exists', '.admin-route-leave', styles]
];

for (const [label, fragment, source] of checks) {
  if (!source.includes(fragment)) throw new Error(`Router transition check failed: ${label}`);
}

console.log('Router transition check passed.');

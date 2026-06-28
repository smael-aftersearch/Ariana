import { readFileSync } from 'node:fs';

const component = readFileSync('examples/admin-panel/src/animate.page.ts', 'utf8');
const template = readFileSync('examples/admin-panel/src/animate.page.html', 'utf8');
const styles = readFileSync('examples/admin-panel/src/animate.page.scss', 'utf8');
const main = readFileSync('examples/admin-panel/src/main.ts', 'utf8');

const checks = [
  ['animate route component', component.includes("@Route('/animate')")],
  ['SCSS styleUrl', component.includes("styleUrl: './animate.page.scss'")],
  ['enter animation usage', template.includes('animate.enter=')],
  ['leave animation usage', template.includes('animate.leave=')],
  ['visible slow duration', styles.includes('--motion-duration: 1200ms')],
  ['continuous keyframe animator', styles.includes('@keyframes dot-orbit')],
  ['dev path route', main.includes("path === '/animate'")],
  ['query route fallback', main.includes("params.get('page') === 'animate'")]
];

for (const [label, ok] of checks) {
  if (!ok) throw new Error(`Admin animate page check failed: ${label}`);
}

console.log('Admin animate page check passed.');

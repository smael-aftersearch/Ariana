import { readFileSync } from 'node:fs';

const component = readFileSync('examples/admin-panel/src/animate.page.ts', 'utf8');
const template = readFileSync('examples/admin-panel/src/animate.page.html', 'utf8');
const styles = readFileSync('examples/admin-panel/src/animate.page.scss', 'utf8');
const main = readFileSync('examples/admin-panel/src/main.ts', 'utf8');
const viteConfig = readFileSync('examples/admin-panel/vite.config.ts', 'utf8');

const checks = [
  ['animate route component', component.includes("@Route('/animate')")],
  ['SCSS styleUrl', component.includes("styleUrl: './animate.page.scss'")],
  ['enter animation usage', template.includes('animate.enter=')],
  ['leave animation usage', template.includes('animate.leave=')],
  ['visible slow duration', styles.includes('--motion-duration: 1200ms')],
  ['normal speed duration', styles.includes('--motion-duration: 420ms')],
  ['speed toggle state', component.includes('slowMode = signal(true)')],
  ['speed toggle button', template.includes('toggleSpeed()')],
  ['scene transition state', component.includes("selectedScene = signal<SceneKey>('flow')")],
  ['scene transition template', template.includes('scene-panel')],
  ['scene transition styles', styles.includes('.scene-panel')],
  ['stagger state', component.includes('staggerItems = signal')],
  ['stagger template', template.includes('stagger-panel')],
  ['stagger styles', styles.includes('.stagger-panel')],
  ['runtime notes template', template.includes('runtime-notes')],
  ['runtime notes styles', styles.includes('.runtime-notes')],
  ['continuous keyframe animator', styles.includes('@keyframes dot-orbit')],
  ['chart keyframe animator', styles.includes('@keyframes chart-pulse')],
  ['dev path route', main.includes("path === '/animate'")],
  ['query route fallback', main.includes("params.get('page') === 'animate'")],
  ['admin Vite config uses plugin source', viteConfig.includes('../../packages/vite-plugin/src/index.ts')]
];

for (const [label, ok] of checks) {
  if (!ok) throw new Error(`Admin animate page check failed: ${label}`);
}

console.log('Admin animate page check passed.');

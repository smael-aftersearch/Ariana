import { readFileSync } from 'node:fs';

const template = readFileSync('examples/admin-panel/src/animation-lab.page.html', 'utf8');
const component = readFileSync('examples/admin-panel/src/animation-lab.page.ts', 'utf8');
const main = readFileSync('examples/admin-panel/src/main.ts', 'utf8');
const scss = readFileSync('examples/admin-panel/src/animation-lab.page.scss', 'utf8');

const checks = [
  ['component uses SCSS styleUrl', component.includes("styleUrl: './animation-lab.page.scss'")],
  ['template uses enter animation', template.includes('animate.enter=')],
  ['template uses leave animation', template.includes('animate.leave=')],
  ['main supports animation lab flag', main.includes("get('lab') === 'animation'")],
  ['main bootstraps lab component', main.includes('AdminAnimationLabPage')],
  ['SCSS has nested rules', scss.includes('&.primary')],
  ['SCSS has responsive rules', scss.includes('@media')]
];

for (const [label, ok] of checks) {
  if (!ok) throw new Error(`Admin animation lab check failed: ${label}`);
}

console.log('Admin animation lab check passed.');

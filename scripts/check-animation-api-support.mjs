import { readFileSync } from 'node:fs';

const source = readFileSync('packages/vite-plugin/src/compiler.ts', 'utf8');

const checks = [
  ['enter transform', 'data-ari-animate-enter'],
  ['leave transform', 'data-ari-animate-leave'],
  ['enter helper', '__ari_applyEnter'],
  ['remove helper', '__ari_removeNodes'],
  ['animation event', 'animationend'],
  ['transition event', 'transitionend'],
  ['class validation', 'normalizeAnimationClassList'],
  ['validation error', 'Invalid Ariana animation class name']
];

for (const [label, fragment] of checks) {
  if (!source.includes(fragment)) {
    throw new Error(`Animation API check failed: ${label}`);
  }
}

console.log('Animation API check passed.');

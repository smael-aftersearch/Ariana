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
  ['validation error', 'Invalid Ariana animation class name'],
  ['computed style duration', 'getComputedStyle(element)'],
  ['animation duration parsing', 'style.animationDuration'],
  ['transition duration parsing', 'style.transitionDuration'],
  ['bounded fallback cleanup', 'Math.min(Math.max(fallbackMs + 80, 120), 5000)']
];

for (const [label, fragment] of checks) {
  if (!source.includes(fragment)) {
    throw new Error(`Animation API check failed: ${label}`);
  }
}

if (source.includes('}, 350)')) {
  throw new Error('Animation API check failed: fixed 350ms fallback is not allowed.');
}

console.log('Animation API check passed.');

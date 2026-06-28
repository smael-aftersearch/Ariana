import { readFileSync } from 'node:fs';

const source = readFileSync('packages/vite-plugin/src/index.ts', 'utf8');

const checks = [
  ['Sass styleUrl extension detection', "endsWith('.scss') || normalizedStyleUrl.endsWith('.sass')"],
  ['Vite inline style import', '?inline'],
  ['CSS fallback keeps text resource behavior', "readTextResource(directory, styleUrl, 'styleUrl')"],
  ['Style metadata replacement remains static', 'style: ${styleResource.expression}']
];

for (const [label, fragment] of checks) {
  if (!source.includes(fragment)) {
    throw new Error(`SCSS styleUrl support gate failed: ${label}`);
  }
}

console.log('SCSS styleUrl support gate passed.');

import { readFileSync } from 'node:fs';

const rootPackage = readFileSync('package.json', 'utf8');
const releaseNotes = readFileSync('docs/releases/1.2.0-rc.1.md', 'utf8');
const workflow = readFileSync('.github/workflows/release-v1-2-rc.yml', 'utf8');
const gates = readFileSync('scripts/v1-release-gates.mjs', 'utf8');

const checks = [
  ['root version', '"version": "1.2.0-rc.1"', rootPackage],
  ['v1.2 gate script', 'release:gates:v1.2', rootPackage],
  ['v1.2 pack script', 'pack:v1.2:candidate', rootPackage],
  ['release notes version', 'Ariana `1.2.0-rc.1`', releaseNotes],
  ['release notes router outlet', 'createRouterOutlet', releaseNotes],
  ['release notes animation API', 'animate.enter', releaseNotes],
  ['manual workflow dispatch', 'workflow_dispatch', workflow],
  ['workflow version input', 'default: 1.2.0-rc.1', workflow],
  ['workflow runs v1.2 gates', 'npm run release:gates:v1.2', workflow],
  ['workflow uploads tarballs', 'npm-packages/*.tgz', workflow],
  ['release gates run router transition check', 'check-router-transition-support.mjs', gates]
];

for (const [label, fragment, source] of checks) {
  if (!source.includes(fragment)) throw new Error(`Ariana 1.2 release candidate check failed: ${label}`);
}

console.log('Ariana 1.2 release candidate check passed.');

import { readFileSync } from 'node:fs';

const rootPackage = readFileSync('package.json', 'utf8');
const releaseNotes = readFileSync('docs/releases/1.2.0-rc.1.md', 'utf8');
const checklist = readFileSync('docs/releases/1.2.0-rc.1-checklist.md', 'utf8');
const workflow = readFileSync('.github/workflows/release-v1-2-rc.yml', 'utf8');
const dryRunWorkflow = readFileSync('.github/workflows/release-v1-2-npm-dry-run.yml', 'utf8');
const gates = readFileSync('scripts/v1-release-gates.mjs', 'utf8');

const checks = [
  ['root version', '"version": "1.2.0-rc.1"', rootPackage],
  ['v1.2 gate script', 'release:gates:v1.2', rootPackage],
  ['v1.2 pack script', 'pack:v1.2:candidate', rootPackage],
  ['release notes version', 'Ariana `1.2.0-rc.1`', releaseNotes],
  ['release notes router outlet', 'createRouterOutlet', releaseNotes],
  ['release notes animation API', 'animate.enter', releaseNotes],
  ['checklist version', '1.2.0-rc.1', checklist],
  ['checklist dry run command', 'npm run publish:v1:dry', checklist],
  ['manual workflow dispatch', 'workflow_dispatch', workflow],
  ['workflow version input', 'default: 1.2.0-rc.1', workflow],
  ['workflow uses lockfile-free install', 'npm install --no-audit --no-fund', workflow],
  ['workflow does not use npm ci', 'npm ci', workflow, false],
  ['workflow runs v1.2 gates', 'npm run release:gates:v1.2', workflow],
  ['workflow uploads tarballs', 'npm-packages/*.tgz', workflow],
  ['dry run workflow dispatch', 'workflow_dispatch', dryRunWorkflow],
  ['dry run workflow version input', 'default: 1.2.0-rc.1', dryRunWorkflow],
  ['dry run workflow command', 'npm run publish:v1:dry', dryRunWorkflow],
  ['dry run workflow tag input', 'dist_tag', dryRunWorkflow],
  ['release gates run router transition check', 'check-router-transition-support.mjs', gates],
  ['release gates run candidate check', 'check-v1-2-release-candidate.mjs', gates]
];

for (const [label, fragment, source, shouldInclude = true] of checks) {
  const ok = source.includes(fragment);
  if (shouldInclude && !ok) throw new Error(`Ariana 1.2 release candidate check failed: ${label}`);
  if (!shouldInclude && ok) throw new Error(`Ariana 1.2 release candidate check failed: ${label}`);
}

console.log('Ariana 1.2 release candidate check passed.');

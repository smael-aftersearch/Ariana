import { readFileSync } from 'node:fs';

const rootPackage = JSON.parse(readFileSync('package.json', 'utf8'));
const manualValidation = readFileSync('docs/releases/1.2.0-rc.1-manual-validation.md', 'utf8');
const stablePlan = readFileSync('docs/releases/1.2.0-stable-promotion-plan.md', 'utf8');
const stableChecklist = readFileSync('docs/releases/1.2.0-stable-checklist.md', 'utf8');

const expectedStableVersion = '1.2.0';

if (rootPackage.version !== expectedStableVersion) {
  throw new Error(`Stable promotion guard expected package.json version ${expectedStableVersion}, received ${rootPackage.version}.`);
}

if (manualValidation.includes('pending')) {
  throw new Error('Stable promotion guard failed: manual validation still contains pending items.');
}

const requiredStableChecks = [
  ['stable plan entry criteria', 'Entry criteria', stablePlan],
  ['stable plan latest publish', 'npm `latest`', stablePlan],
  ['stable plan rebuild rule', 'must be rebuilt and re-verified', stablePlan],
  ['stable checklist entry confirmation', 'Entry confirmation', stableChecklist],
  ['stable checklist local validation', 'Stable local validation', stableChecklist],
  ['stable checklist publish gates', 'Stable publish gates', stableChecklist],
  ['stable checklist stop rule', 'Stop rule', stableChecklist]
];

for (const [label, fragment, source] of requiredStableChecks) {
  if (!source.includes(fragment)) throw new Error(`Stable promotion guard failed: ${label}`);
}

console.log('Ariana 1.2 stable promotion guard passed.');

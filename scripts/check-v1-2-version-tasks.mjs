import { readFileSync } from 'node:fs';

const tasks = readFileSync('docs/releases/1.2.0-version-tasks.md', 'utf8');
const manualValidation = readFileSync('docs/releases/1.2.0-rc.1-manual-validation.md', 'utf8');
const stablePlan = readFileSync('docs/releases/1.2.0-stable-promotion-plan.md', 'utf8');
const stableChecklist = readFileSync('docs/releases/1.2.0-stable-checklist.md', 'utf8');
const stableGuard = readFileSync('scripts/check-v1-2-stable-promotion-guard.mjs', 'utf8');

const checks = [
  ['current rc version', '1.2.0-rc.1', tasks],
  ['release strategy next path', 'npm next', tasks],
  ['manual validation section', 'Manual validation tasks', tasks],
  ['stable promotion section', 'Stable promotion tasks', tasks],
  ['stable rebuild rule', 'Do not convert the RC artifact into stable', tasks],
  ['manual local gates', 'npm run release:gates:v1.2', manualValidation],
  ['manual animate route', '/animate', manualValidation],
  ['manual route outlet route', '/route-outlet', manualValidation],
  ['manual npm next release', 'RELEASE_NEXT', manualValidation],
  ['manual registry verification', 'Ariana 1.2 Verify NPM Release', manualValidation],
  ['stable entry criteria', 'Entry criteria', stablePlan],
  ['stable version change', '1.2.0-rc.1` to `1.2.0', stablePlan],
  ['stable latest tag', 'npm `latest`', stablePlan],
  ['stable rebuild rule', 'must be rebuilt and re-verified', stablePlan],
  ['stable rollback rule', 'Rollback rule', stablePlan],
  ['stable checklist entry confirmation', 'Entry confirmation', stableChecklist],
  ['stable checklist local validation', 'Stable local validation', stableChecklist],
  ['stable checklist publish gates', 'Stable publish gates', stableChecklist],
  ['stable checklist stop rule', 'Stop rule', stableChecklist],
  ['stable guard version check', 'expectedStableVersion', stableGuard],
  ['stable guard manual validation check', 'manual validation still contains pending items', stableGuard],
  ['stable guard success message', 'stable promotion guard passed', stableGuard]
];

for (const [label, fragment, source] of checks) {
  if (!source.includes(fragment)) throw new Error(`Ariana 1.2 version task check failed: ${label}`);
}

console.log('Ariana 1.2 version task check passed.');

import { readFileSync } from 'node:fs';

const rootPackage = readFileSync('package.json', 'utf8');
const releaseNotes = readFileSync('docs/releases/1.2.0-rc.1.md', 'utf8');
const checklist = readFileSync('docs/releases/1.2.0-rc.1-checklist.md', 'utf8');
const postRelease = readFileSync('docs/releases/1.2.0-rc.1-post-release.md', 'utf8');
const releaseSequence = readFileSync('docs/releases/1.2.0-rc.1-release-sequence.md', 'utf8');
const workflow = readFileSync('.github/workflows/release-v1-2-rc.yml', 'utf8');
const dryRunWorkflow = readFileSync('.github/workflows/release-v1-2-npm-dry-run.yml', 'utf8');
const nextWorkflow = readFileSync('.github/workflows/release-v1-2-next.yml', 'utf8');
const verifyWorkflow = readFileSync('.github/workflows/release-v1-2-verify.yml', 'utf8');
const githubReleaseWorkflow = readFileSync('.github/workflows/release-v1-2-github-release.yml', 'utf8');
const verifyScript = readFileSync('scripts/verify-npm-release.mjs', 'utf8');
const packedSmoke = readFileSync('scripts/packed-candidate-smoke.mjs', 'utf8');
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
  ['checklist protected next release', 'RELEASE_NEXT', checklist],
  ['checklist github release', 'Ariana 1.2 GitHub Release', checklist],
  ['post release verification docs', 'verify-npm-release.mjs', postRelease],
  ['post release rollback docs', 'dist-tag', postRelease],
  ['release sequence github release', 'CREATE_GITHUB_RELEASE', releaseSequence],
  ['release sequence external smoke', 'External install smoke', releaseSequence],
  ['manual workflow dispatch', 'workflow_dispatch', workflow],
  ['workflow version input', 'default: 1.2.0-rc.1', workflow],
  ['workflow uses lockfile-free install', 'npm install --no-audit --no-fund', workflow],
  ['workflow does not use npm ci', 'npm ci', workflow, false],
  ['workflow runs v1.2 gates', 'npm run release:gates:v1.2', workflow],
  ['workflow runs packed smoke', 'node scripts/packed-candidate-smoke.mjs', workflow],
  ['workflow uploads tarballs', 'npm-packages/*.tgz', workflow],
  ['dry run workflow dispatch', 'workflow_dispatch', dryRunWorkflow],
  ['dry run workflow version input', 'default: 1.2.0-rc.1', dryRunWorkflow],
  ['dry run workflow command', 'npm run publish:v1:dry', dryRunWorkflow],
  ['dry run workflow packed smoke', 'node scripts/packed-candidate-smoke.mjs', dryRunWorkflow],
  ['dry run workflow tag input', 'dist_tag', dryRunWorkflow],
  ['next workflow dispatch', 'workflow_dispatch', nextWorkflow],
  ['next workflow confirmation', 'RELEASE_NEXT', nextWorkflow],
  ['next workflow environment', 'environment: npm-next', nextWorkflow],
  ['next workflow token', 'NODE_AUTH_TOKEN', nextWorkflow],
  ['next workflow next tag', 'NPM_DIST_TAG: next', nextWorkflow],
  ['github release workflow dispatch', 'workflow_dispatch', githubReleaseWorkflow],
  ['github release workflow confirmation', 'CREATE_GITHUB_RELEASE', githubReleaseWorkflow],
  ['github release workflow draft', 'draft: true', githubReleaseWorkflow],
  ['github release workflow prerelease', 'prerelease: true', githubReleaseWorkflow],
  ['github release workflow notes', 'body_path: docs/releases/1.2.0-rc.1.md', githubReleaseWorkflow],
  ['verify workflow dispatch', 'workflow_dispatch', verifyWorkflow],
  ['verify workflow command', 'node scripts/verify-npm-release.mjs', verifyWorkflow],
  ['verify script package list', '@ariana-framework', verifyScript],
  ['verify script dist tag check', 'dist-tags.${releaseTag}', verifyScript],
  ['packed smoke installs tarballs', 'npm', packedSmoke],
  ['packed smoke imports core', '@ariana-framework/core', packedSmoke],
  ['packed smoke imports router', '@ariana-framework/router', packedSmoke],
  ['release gates run router transition check', 'check-router-transition-support.mjs', gates],
  ['release gates run candidate check', 'check-v1-2-release-candidate.mjs', gates]
];

for (const [label, fragment, source, shouldInclude = true] of checks) {
  const ok = source.includes(fragment);
  if (shouldInclude && !ok) throw new Error(`Ariana 1.2 release candidate check failed: ${label}`);
  if (!shouldInclude && ok) throw new Error(`Ariana 1.2 release candidate check failed: ${label}`);
}

console.log('Ariana 1.2 release candidate check passed.');

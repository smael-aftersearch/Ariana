import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const rootPackage = readFileSync('package.json', 'utf8');
const releaseNotes = readFileSync('docs/releases/1.2.0-rc.1.md', 'utf8');
const checklist = readFileSync('docs/releases/1.2.0-rc.1-checklist.md', 'utf8');
const postRelease = readFileSync('docs/releases/1.2.0-rc.1-post-release.md', 'utf8');
const releaseSequence = readFileSync('docs/releases/1.2.0-rc.1-release-sequence.md', 'utf8');
const artifactVerification = readFileSync('docs/releases/1.2.0-rc.1-artifact-verification.md', 'utf8');
const workflow = readFileSync('.github/workflows/release-v1-2-rc.yml', 'utf8');
const dryRunWorkflow = readFileSync('.github/workflows/release-v1-2-npm-dry-run.yml', 'utf8');
const nextWorkflow = readFileSync('.github/workflows/release-v1-2-next.yml', 'utf8');
const verifyWorkflow = readFileSync('.github/workflows/release-v1-2-verify.yml', 'utf8');
const githubReleaseWorkflow = readFileSync('.github/workflows/release-v1-2-github-release.yml', 'utf8');
const hygieneWorkflow = readFileSync('.github/workflows/workflow-hygiene.yml', 'utf8');
const verifyScript = readFileSync('scripts/verify-npm-release.mjs', 'utf8');
const packedSmoke = readFileSync('scripts/packed-candidate-smoke.mjs', 'utf8');
const manifestScript = readFileSync('scripts/create-release-manifest.mjs', 'utf8');
const manifestVerifyScript = readFileSync('scripts/verify-release-manifest.mjs', 'utf8');
const releaseSummaryScript = readFileSync('scripts/create-release-summary.mjs', 'utf8');
const workflowHygieneScript = readFileSync('scripts/check-workflow-hygiene.mjs', 'utf8');
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
  ['release sequence checksum', 'sha256sum -c', releaseSequence],
  ['artifact verification checksum docs', 'ariana-1.2.0-rc.1-sha256.txt', artifactVerification],
  ['artifact verification manifest docs', 'ariana-1.2.0-rc.1-manifest.json', artifactVerification],
  ['artifact verification script docs', 'verify-release-manifest.mjs', artifactVerification],
  ['artifact verification summary docs', 'create-release-summary.mjs', artifactVerification],
  ['manual workflow dispatch', 'workflow_dispatch', workflow],
  ['workflow version input', 'default: 1.2.0-rc.1', workflow],
  ['workflow uses lockfile-free install', 'npm install --no-audit --no-fund', workflow],
  ['workflow does not use npm ci', 'npm ci', workflow, false],
  ['workflow runs v1.2 gates', 'npm run release:gates:v1.2', workflow],
  ['workflow runs packed smoke', 'node scripts/packed-candidate-smoke.mjs', workflow],
  ['workflow creates manifest', 'node scripts/create-release-manifest.mjs', workflow],
  ['workflow verifies manifest', 'node scripts/verify-release-manifest.mjs', workflow],
  ['workflow creates summary', 'node scripts/create-release-summary.mjs', workflow],
  ['workflow uploads tarballs', 'npm-packages/*.tgz', workflow],
  ['workflow uploads manifest', 'release-manifests/*', workflow],
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
  ['github release workflow creates manifest', 'node scripts/create-release-manifest.mjs', githubReleaseWorkflow],
  ['github release workflow verifies manifest', 'node scripts/verify-release-manifest.mjs', githubReleaseWorkflow],
  ['github release workflow creates summary', 'node scripts/create-release-summary.mjs', githubReleaseWorkflow],
  ['github release workflow attaches files', 'release-manifests/*', githubReleaseWorkflow],
  ['github release workflow draft', 'draft: true', githubReleaseWorkflow],
  ['github release workflow prerelease', 'prerelease: true', githubReleaseWorkflow],
  ['github release workflow notes', 'body_path: docs/releases/1.2.0-rc.1.md', githubReleaseWorkflow],
  ['verify workflow dispatch', 'workflow_dispatch', verifyWorkflow],
  ['verify workflow command', 'node scripts/verify-npm-release.mjs', verifyWorkflow],
  ['hygiene workflow dispatch', 'workflow_dispatch', hygieneWorkflow],
  ['hygiene workflow pull request', 'pull_request', hygieneWorkflow],
  ['hygiene workflow command', 'node scripts/check-workflow-hygiene.mjs', hygieneWorkflow],
  ['verify script package list', '@ariana-framework', verifyScript],
  ['verify script dist tag check', 'dist-tags.${releaseTag}', verifyScript],
  ['packed smoke installs tarballs', 'npm', packedSmoke],
  ['packed smoke imports core', '@ariana-framework/core', packedSmoke],
  ['packed smoke imports router', '@ariana-framework/router', packedSmoke],
  ['packed smoke checks package name', 'installed package name mismatch', packedSmoke],
  ['packed smoke checks package version', 'installed package version mismatch', packedSmoke],
  ['packed smoke checks package exports', 'package exports are missing', packedSmoke],
  ['manifest script writes sha256', 'sha256', manifestScript],
  ['manifest script checks packages', 'expectedPackages', manifestScript],
  ['manifest verify script reads manifest', 'ariana-${version}-manifest.json', manifestVerifyScript],
  ['manifest verify script checks size', 'size mismatch', manifestVerifyScript],
  ['manifest verify script checks sha', 'sha256 mismatch', manifestVerifyScript],
  ['manifest verify script checks checksum file', 'missing checksum line', manifestVerifyScript],
  ['release summary script writes summary', 'summary.md', releaseSummaryScript],
  ['release summary script includes table', '| Package | File | Size | SHA256 |', releaseSummaryScript],
  ['workflow hygiene script checks lockfile install', 'npm ci requires a package-lock.json file', workflowHygieneScript],
  ['workflow hygiene script checks npm cache', 'setup-node npm cache requires a npm lockfile', workflowHygieneScript],
  ['workflow hygiene script checks Node 22', 'node-version: 22', workflowHygieneScript],
  ['release gates run router transition check', 'check-router-transition-support.mjs', gates],
  ['release gates run candidate check', 'check-v1-2-release-candidate.mjs', gates]
];

for (const [label, fragment, source, shouldInclude = true] of checks) {
  const ok = source.includes(fragment);
  if (shouldInclude && !ok) throw new Error(`Ariana 1.2 release candidate check failed: ${label}`);
  if (!shouldInclude && ok) throw new Error(`Ariana 1.2 release candidate check failed: ${label}`);
}

execFileSync(process.execPath, ['scripts/check-workflow-hygiene.mjs'], { stdio: 'inherit' });

console.log('Ariana 1.2 release candidate check passed.');

import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { run, runNode } from './lib/run-command.mjs';

const root = process.cwd();
const rootPackage = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const releaseVersion = process.env.RELEASE_VERSION ?? rootPackage.version;
const releaseTag = process.env.NPM_DIST_TAG ?? 'latest';
const outDir = join(root, 'npm-packages');
const dryRun = process.argv.includes('--dry-run');
const packageOrder = ['core', 'compiler', 'router', 'forms', 'query', 'rendering', 'vite-plugin'];
const authToken = process.env.NPM_TOKEN ?? process.env.NODE_AUTH_TOKEN;
let tempConfigDir;
let userConfig;

if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(releaseVersion)) {
  throw new Error(`Invalid release version: ${releaseVersion}`);
}

if (!dryRun && !authToken) {
  console.error('NPM_TOKEN or NODE_AUTH_TOKEN is not set.');
  process.exit(1);
}

if (authToken) {
  tempConfigDir = mkdtempSync(join(tmpdir(), 'ariana-npm-'));
  userConfig = join(tempConfigDir, '.npmrc');
  writeFileSync(userConfig, `registry=https://registry.npmjs.org/\n//registry.npmjs.org/:_authToken=${authToken}\n`);
}

try {
  runNode(['scripts/pack-v1-candidate.mjs'], { cwd: root, env: { ...process.env, RELEASE_VERSION: releaseVersion } });

  const tarballs = readdirSync(outDir).filter(name => name.endsWith('.tgz'));
  for (const name of packageOrder) {
    const tarball = tarballs.find(item => item.startsWith(`ariana-${name}-${releaseVersion}`));
    if (!tarball) throw new Error(`Missing ${releaseVersion} tarball for ${name}.`);
    const args = ['publish', join(outDir, tarball), '--access', 'public', '--tag', releaseTag];
    if (userConfig) args.push('--userconfig', userConfig);
    if (dryRun) args.push('--dry-run');
    run('npm', args, { cwd: root });
  }
} finally {
  if (tempConfigDir) rmSync(tempConfigDir, { recursive: true, force: true });
}

import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { run, runNode } from './lib/run-command.mjs';

const root = process.cwd();
const outDir = join(root, 'npm-packages');
const dryRun = process.argv.includes('--dry-run');
const packageOrder = ['core', 'compiler', 'router', 'forms', 'query', 'rendering', 'vite-plugin'];
const authToken = process.env.NPM_TOKEN ?? process.env.NODE_AUTH_TOKEN;
let tempConfigDir;
let userConfig;

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
  runNode(['scripts/pack-v1-candidate.mjs'], { cwd: root });

  const tarballs = readdirSync(outDir).filter(name => name.endsWith('.tgz'));
  for (const name of packageOrder) {
    const tarball = tarballs.find(item => item.startsWith(`ariana-${name}-1.0.0`));
    if (!tarball) throw new Error(`Missing 1.0.0 tarball for ${name}.`);
    const args = ['publish', join(outDir, tarball), '--access', 'public', '--tag', 'latest'];
    if (userConfig) args.push('--userconfig', userConfig);
    if (dryRun) args.push('--dry-run');
    run('npm', args, { cwd: root });
  }
} finally {
  if (tempConfigDir) rmSync(tempConfigDir, { recursive: true, force: true });
}

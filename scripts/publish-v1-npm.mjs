import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const outDir = join(root, 'npm-packages');
const dryRun = process.argv.includes('--dry-run');
const packageOrder = ['core', 'compiler', 'router', 'forms', 'query', 'rendering', 'vite-plugin'];

if (!dryRun && !process.env.NPM_TOKEN) {
  console.error('NPM_TOKEN is not set.');
  process.exit(1);
}

execFileSync('node', ['scripts/pack-v1-candidate.mjs'], { cwd: root, stdio: 'inherit' });

const tarballs = readdirSync(outDir).filter(name => name.endsWith('.tgz'));
for (const name of packageOrder) {
  const tarball = tarballs.find(item => item.startsWith(`ariana-${name}-1.0.0`));
  if (!tarball) throw new Error(`Missing 1.0.0 tarball for ${name}.`);
  const args = ['publish', join(outDir, tarball), '--access', 'public', '--tag', 'latest'];
  if (dryRun) args.push('--dry-run');
  execFileSync('npm', args, { cwd: root, stdio: 'inherit' });
}

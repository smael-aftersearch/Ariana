import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const outDir = join(root, 'npm-packages');
const dryRun = process.argv.includes('--dry-run');

if (!dryRun && !process.env.NPM_TOKEN) {
  console.error('NPM_TOKEN is not set. Refusing to publish.');
  console.error('Run `npm run pack:npm` to create tarballs, then publish with an authenticated npm account.');
  process.exit(1);
}

if (!existsSync(outDir)) {
  execFileSync('npm', ['run', 'pack:npm'], { cwd: root, stdio: 'inherit' });
}

const tarballs = readdirSync(outDir).filter(name => name.endsWith('.tgz')).sort();

for (const tarball of tarballs) {
  const fullPath = join(outDir, tarball);
  if (dryRun) {
    console.log(`Dry-run publish check for ${tarball}...`);
    execFileSync('npm', ['publish', fullPath, '--access', 'public', '--tag', 'alpha', '--dry-run'], { cwd: root, stdio: 'inherit' });
  } else {
    console.log(`Publishing ${tarball}...`);
    execFileSync('npm', ['publish', fullPath, '--access', 'public', '--tag', 'alpha'], { cwd: root, stdio: 'inherit' });
  }
}

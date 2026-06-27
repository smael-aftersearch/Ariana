import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const outDir = join(root, 'npm-packages');
const dryRun = process.argv.includes('--dry-run');
const npmTag = 'latest';
const packageOrder = ['core', 'compiler', 'router', 'forms', 'query', 'rendering', 'vite-plugin'];

if (!dryRun && !process.env.NPM_TOKEN) {
  console.error('NPM_TOKEN is not set. Refusing to publish.');
  console.error('Run the release verification first, then publish with an authenticated npm account.');
  process.exit(1);
}

if (!existsSync(outDir)) {
  execFileSync('npm', ['run', 'verify:release'], { cwd: root, stdio: 'inherit' });
}

const tarballs = readdirSync(outDir).filter(name => name.endsWith('.tgz'));
if (tarballs.length !== packageOrder.length) throw new Error(`Expected ${packageOrder.length} tarballs, found ${tarballs.length}.`);

const orderedTarballs = packageOrder.map(name => {
  const match = tarballs.find(tarball => tarball.startsWith(`ariana-${name}-`));
  if (!match) throw new Error(`Missing tarball for @ariana-framework/${name}.`);
  return match;
});

for (const tarball of orderedTarballs) {
  const fullPath = join(outDir, tarball);
  try {
    if (dryRun) {
      console.log(`Dry-run publish check for ${tarball}...`);
      execFileSync('npm', ['publish', fullPath, '--access', 'public', '--tag', npmTag, '--dry-run'], { cwd: root, stdio: 'inherit' });
    } else {
      console.log(`Publishing ${tarball}...`);
      execFileSync('npm', ['publish', fullPath, '--access', 'public', '--tag', npmTag], { cwd: root, stdio: 'inherit' });
    }
  } catch (error) {
    console.error('\nNPM publish failed. Check these first:');
    console.error('- If your npm account has 2FA enabled, the automation/granular token must have bypass 2FA enabled.');
    console.error('- If publishing under an npm organization scope, the token must have access to that organization/scope.');
    console.error('- Confirm the package scope is owned by the npm account or organization used by NPM_TOKEN.');
    throw error;
  }
}

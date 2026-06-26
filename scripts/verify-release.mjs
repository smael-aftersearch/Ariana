import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const releaseVersion = '0.4.0-alpha.0';
const packages = ['core', 'compiler', 'router', 'forms', 'query', 'rendering', 'vite-plugin'];
const requiredRootFiles = ['README.md', 'CHANGELOG.md', 'LICENSE', 'RELEASE_CHECKLIST.md', 'SECURITY.md'];
const problems = [];

for (const file of requiredRootFiles) {
  if (!existsSync(join(root, file))) problems.push(`Missing required release file: ${file}`);
}

const rootPackage = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
if (!rootPackage.version) problems.push('Root package version is missing.');
if (!rootPackage.scripts?.build) problems.push('Root package must define a build script.');
if (!rootPackage.scripts?.test) problems.push('Root package must define a test script.');

for (const name of packages) {
  const packageDir = join(root, 'packages', name);
  const packageJsonPath = join(packageDir, 'package.json');
  const distPath = join(packageDir, 'dist');

  if (!existsSync(packageJsonPath)) {
    problems.push(`Missing package.json for ${name}`);
    continue;
  }

  if (!existsSync(distPath)) problems.push(`Missing dist output for ${name}. Run npm run build first.`);

  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  if (!pkg.name?.startsWith('@ariana/')) problems.push(`Unexpected package name for ${name}: ${pkg.name}`);
  if (!pkg.version) problems.push(`Missing package version for ${pkg.name}`);
  if (pkg.version !== releaseVersion) problems.push(`Unexpected version for ${pkg.name}: ${pkg.version}`);
  if (!pkg.main || !pkg.types) problems.push(`Package ${pkg.name} must define main and types.`);
  if (!pkg.scripts?.build) problems.push(`Package ${pkg.name} must define a build script.`);
}

const vitePackage = JSON.parse(readFileSync(join(root, 'packages', 'vite-plugin', 'package.json'), 'utf8'));
const vitePeers = { ...(vitePackage.peerDependencies ?? {}), ...(vitePackage.dependencies ?? {}) };
if (!vitePeers['@ariana/compiler']) problems.push('@ariana/vite-plugin must declare @ariana/compiler as a dependency or peer dependency.');

if (problems.length > 0) {
  throw new Error(`Release verification failed:\n- ${problems.join('\n- ')}`);
}

execFileSync('node', ['scripts/pack-npm.mjs'], { cwd: root, stdio: 'inherit' });

const tarballs = readdirSync(join(root, 'npm-packages')).filter(name => name.endsWith('.tgz'));
if (tarballs.length !== packages.length) throw new Error(`Expected ${packages.length} npm tarballs, found ${tarballs.length}.`);

for (const name of packages) {
  const expectedPrefix = `ariana-${name}-`;
  if (!tarballs.some(tarball => tarball.startsWith(expectedPrefix))) throw new Error(`Missing tarball for @ariana/${name}.`);
}

console.log('Release verification passed.');

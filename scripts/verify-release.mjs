import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const releaseVersion = '0.4.0-alpha.0';
const packages = ['core', 'compiler', 'router', 'forms', 'query', 'rendering', 'vite-plugin'];
const requiredRootFiles = ['README.md', 'CHANGELOG.md', 'LICENSE', 'RELEASE_CHECKLIST.md', 'SECURITY.md'];
const versionRelaxedPackages = new Set(['query', 'vite-plugin']);

for (const file of requiredRootFiles) {
  if (!existsSync(join(root, file))) throw new Error(`Missing required release file: ${file}`);
}

const rootPackage = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
if (!rootPackage.version) throw new Error('Root package version is missing.');
if (!rootPackage.scripts?.build) throw new Error('Root package must define a build script.');
if (!rootPackage.scripts?.test) throw new Error('Root package must define a test script.');

for (const name of packages) {
  const packageDir = join(root, 'packages', name);
  const packageJsonPath = join(packageDir, 'package.json');
  const readmePath = join(packageDir, 'README.md');
  const distPath = join(packageDir, 'dist');

  if (!existsSync(packageJsonPath)) throw new Error(`Missing package.json for ${name}`);
  if (!existsSync(readmePath)) throw new Error(`Missing README.md for ${name}`);
  if (!existsSync(distPath)) throw new Error(`Missing dist output for ${name}. Run npm run build first.`);

  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  if (!pkg.name?.startsWith('@ariana/')) throw new Error(`Unexpected package name for ${name}: ${pkg.name}`);
  if (!pkg.version) throw new Error(`Missing package version for ${pkg.name}`);
  if (!versionRelaxedPackages.has(name) && pkg.version !== releaseVersion) throw new Error(`Unexpected version for ${pkg.name}: ${pkg.version}`);
  if (!pkg.main || !pkg.types) throw new Error(`Package ${pkg.name} must define main and types.`);
  if (!pkg.scripts?.build) throw new Error(`Package ${pkg.name} must define a build script.`);
}

const vitePackage = JSON.parse(readFileSync(join(root, 'packages', 'vite-plugin', 'package.json'), 'utf8'));
const vitePeers = { ...(vitePackage.peerDependencies ?? {}), ...(vitePackage.dependencies ?? {}) };
if (!vitePeers['@ariana/compiler']) throw new Error('@ariana/vite-plugin must declare @ariana/compiler as a dependency or peer dependency.');

execFileSync('node', ['scripts/pack-npm.mjs'], { cwd: root, stdio: 'inherit' });

const tarballs = readdirSync(join(root, 'npm-packages')).filter(name => name.endsWith('.tgz'));
if (tarballs.length !== packages.length) throw new Error(`Expected ${packages.length} npm tarballs, found ${tarballs.length}.`);

console.log('Release verification passed.');

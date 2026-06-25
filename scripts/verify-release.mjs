import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const packages = ['core', 'compiler', 'router', 'forms', 'query', 'rendering', 'vite-plugin'];
const requiredRootFiles = ['README.md', 'CHANGELOG.md', 'LICENSE', 'RELEASE_CHECKLIST.md', 'SECURITY.md'];

for (const file of requiredRootFiles) {
  if (!existsSync(join(root, file))) throw new Error(`Missing required release file: ${file}`);
}

const rootPackage = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
if (!rootPackage.version) throw new Error('Root package version is missing.');

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
  if (pkg.version !== '0.4.0-alpha.0') throw new Error(`Unexpected version for ${pkg.name}: ${pkg.version}`);
  if (!pkg.main || !pkg.types) throw new Error(`Package ${pkg.name} must define main and types.`);
}

execFileSync('node', ['scripts/pack-npm.mjs'], { cwd: root, stdio: 'inherit' });

const tarballs = readdirSync(join(root, 'npm-packages')).filter(name => name.endsWith('.tgz'));
if (tarballs.length !== packages.length) throw new Error(`Expected ${packages.length} npm tarballs, found ${tarballs.length}.`);

console.log('Release verification passed.');

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const packageDir = join(root, 'npm-packages');
const inspectDir = join(root, '.tarball-inspection');
const expectedScope = '@ariana-framework';
const expectedVersion = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
const packages = ['core', 'compiler', 'router', 'forms', 'query', 'rendering', 'vite-plugin'];

if (!existsSync(packageDir)) execFileSync('npm', ['run', 'verify:release'], { cwd: root, stdio: 'inherit' });

rmSync(inspectDir, { recursive: true, force: true });
mkdirSync(inspectDir, { recursive: true });

const tarballs = readdirSync(packageDir).filter(name => name.endsWith('.tgz'));
if (tarballs.length !== packages.length) throw new Error(`Expected ${packages.length} tarballs, found ${tarballs.length}.`);

for (const packageName of packages) {
  const tarball = tarballs.find(name => name.startsWith(`ariana-${packageName}-`));
  if (!tarball) throw new Error(`Missing tarball for ${packageName}.`);

  const target = join(inspectDir, packageName);
  mkdirSync(target, { recursive: true });
  execFileSync('tar', ['-xzf', join(packageDir, tarball), '-C', target], { cwd: root, stdio: 'inherit' });

  const packageRoot = join(target, 'package');
  const packageJsonPath = join(packageRoot, 'package.json');
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const expectedName = `${expectedScope}/${packageName}`;

  if (pkg.name !== expectedName) throw new Error(`Unexpected package name in ${tarball}: ${pkg.name}`);
  if (pkg.version !== expectedVersion) throw new Error(`Unexpected version in ${tarball}: ${pkg.version}; expected ${expectedVersion}`);
  if (!pkg.main || !pkg.types) throw new Error(`Missing main/types in ${tarball}.`);

  const serialized = JSON.stringify(pkg);
  if (serialized.includes('file:../')) throw new Error(`Workspace dependency leaked into ${tarball}.`);
  if (serialized.includes('@ariana/')) throw new Error(`Old @ariana scope leaked into package metadata for ${tarball}.`);

  scanPublishedFiles(packageRoot, tarball);
}

rmSync(inspectDir, { recursive: true, force: true });
console.log(`Tarball inspection passed for ${expectedVersion}.`);

function scanPublishedFiles(directory, tarball) {
  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      scanPublishedFiles(fullPath, tarball);
      continue;
    }
    if (!/\.(js|d\.ts|json)$/.test(entry)) continue;
    const content = readFileSync(fullPath, 'utf8');
    if (content.includes('file:../')) throw new Error(`Workspace dependency leaked into ${tarball}: ${fullPath}`);
    if (content.includes('@ariana/')) throw new Error(`Old @ariana scope leaked into ${tarball}: ${fullPath}`);
  }
}

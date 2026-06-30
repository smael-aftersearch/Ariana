import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { run } from './lib/run-command.mjs';

const root = process.cwd();
const version = process.env.RELEASE_VERSION ?? JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
const outDir = join(root, 'npm-packages');
const packageNames = ['core', 'compiler', 'router', 'forms', 'query', 'rendering', 'vite-plugin'];
const files = readdirSync(outDir);

for (const name of packageNames) {
  const tarball = files.find(item => item === `ariana-${name}-${version}.tgz`);
  if (!tarball) throw new Error(`Missing tarball: ariana-${name}-${version}.tgz`);

  const tempDir = mkdtempSync(join(tmpdir(), `ariana-${name}-deps-`));
  try {
    run('tar', ['-xzf', resolve(outDir, tarball), '-C', tempDir]);
    const packageJson = JSON.parse(readFileSync(join(tempDir, 'package', 'package.json'), 'utf8'));
    verifyDependencyMap(tarball, packageJson.dependencies, 'dependencies');
    verifyDependencyMap(tarball, packageJson.peerDependencies, 'peerDependencies');
    verifyDependencyMap(tarball, packageJson.optionalDependencies, 'optionalDependencies');
    verifyDependencyMap(tarball, packageJson.devDependencies, 'devDependencies');
    console.log(`${tarball} internal dependencies verified.`);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

console.log(`Packed internal dependencies verified for ${version}.`);

function verifyDependencyMap(tarball, dependencies, label) {
  if (!dependencies) return;
  for (const [dependencyName, dependencyVersion] of Object.entries(dependencies)) {
    if (typeof dependencyVersion !== 'string') throw new Error(`${tarball}: ${label}.${dependencyName} must be a string.`);
    if (dependencyVersion.startsWith('workspace:')) throw new Error(`${tarball}: ${label}.${dependencyName} still uses workspace protocol.`);
    if (dependencyVersion.startsWith('file:')) throw new Error(`${tarball}: ${label}.${dependencyName} still uses file protocol.`);
    if (dependencyVersion.startsWith('link:')) throw new Error(`${tarball}: ${label}.${dependencyName} still uses link protocol.`);
    if (dependencyName.startsWith('@ariana-framework/') && dependencyVersion !== version) {
      throw new Error(`${tarball}: ${label}.${dependencyName} must be ${version}, received ${dependencyVersion}.`);
    }
  }
}

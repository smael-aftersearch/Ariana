import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
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

  const tempDir = mkdtempSync(join(tmpdir(), `ariana-${name}-contents-`));
  try {
    run('tar', ['-xzf', resolve(outDir, tarball), '-C', tempDir]);
    const packageRoot = join(tempDir, 'package');
    const packageJson = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));
    const expectedPackageName = `@ariana-framework/${name}`;

    if (packageJson.name !== expectedPackageName) throw new Error(`${tarball}: package name mismatch.`);
    if (packageJson.version !== version) throw new Error(`${tarball}: package version mismatch.`);
    if (packageJson.type !== 'module') throw new Error(`${tarball}: package type must be module.`);
    if (!packageJson.exports) throw new Error(`${tarball}: package exports are missing.`);

    assertPackageFile(packageRoot, tarball, packageJson.main, 'main');
    assertPackageFile(packageRoot, tarball, packageJson.types, 'types');
    assertExportPaths(packageRoot, tarball, packageJson.exports);

    const distFiles = readdirSync(join(packageRoot, 'dist'));
    if (!distFiles.some(file => file.endsWith('.js'))) throw new Error(`${tarball}: dist js output is missing.`);
    if (!distFiles.some(file => file.endsWith('.d.ts'))) throw new Error(`${tarball}: dist type declarations are missing.`);

    console.log(`${tarball} content verified.`);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

console.log(`Packed tarball contents verified for ${version}.`);

function assertExportPaths(packageRoot, tarball, exportsValue) {
  const paths = collectExportTargets(exportsValue);
  if (paths.length === 0) throw new Error(`${tarball}: package exports do not contain file targets.`);
  for (const target of paths) assertPackageFile(packageRoot, tarball, target, 'exports');
}

function collectExportTargets(value) {
  if (typeof value === 'string') return [value];
  if (!value || typeof value !== 'object') return [];
  return Object.values(value).flatMap(collectExportTargets);
}

function assertPackageFile(packageRoot, tarball, value, label) {
  if (typeof value !== 'string') throw new Error(`${tarball}: ${label} must be a string file path.`);
  if (!value.startsWith('./')) throw new Error(`${tarball}: ${label} must stay inside the package.`);
  if (value.includes('..')) throw new Error(`${tarball}: ${label} must not contain parent directory traversal.`);
  const absolutePath = join(packageRoot, value);
  if (!existsSync(absolutePath)) throw new Error(`${tarball}: ${label} target is missing: ${value}`);
}

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const outDir = join(root, 'npm-packages');
const stagingDir = join(root, '.npm-pack-staging');
const rootPackage = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const releaseVersion = process.env.RELEASE_VERSION ?? rootPackage.version;
const releaseScope = '@ariana-framework';
const packages = ['core', 'compiler', 'router', 'forms', 'query', 'rendering', 'vite-plugin'];

if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(releaseVersion)) {
  throw new Error(`Invalid release version: ${releaseVersion}`);
}

rmSync(outDir, { recursive: true, force: true });
rmSync(stagingDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
mkdirSync(stagingDir, { recursive: true });

for (const name of packages) {
  const sourceDir = join(root, 'packages', name);
  const packageJsonPath = join(sourceDir, 'package.json');
  const distDir = join(sourceDir, 'dist');

  if (!existsSync(packageJsonPath)) throw new Error(`Missing package.json for ${name}`);
  if (!existsSync(distDir)) throw new Error(`Missing dist output for ${name}. Run npm run build first.`);

  const stagePackageDir = join(stagingDir, name);
  mkdirSync(stagePackageDir, { recursive: true });
  cpSync(distDir, join(stagePackageDir, 'dist'), { recursive: true });
  rewritePackageImports(join(stagePackageDir, 'dist'));

  const sourceReadme = join(sourceDir, 'README.md');
  if (existsSync(sourceReadme)) cpSync(sourceReadme, join(stagePackageDir, 'README.md'));

  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  pkg.name = `${releaseScope}/${name}`;
  pkg.version = releaseVersion;
  sanitizeDependencies(pkg.dependencies);
  sanitizeDependencies(pkg.peerDependencies);
  sanitizeDependencies(pkg.optionalDependencies);
  delete pkg.devDependencies;
  delete pkg.scripts;
  writeFileSync(join(stagePackageDir, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);

  console.log(`Packing ${pkg.name}@${releaseVersion}...`);
  execFileSync('npm', ['pack', stagePackageDir, '--pack-destination', outDir], { cwd: root, stdio: 'inherit' });

  const generatedName = `ariana-framework-${name}-${releaseVersion}.tgz`;
  const workflowName = `ariana-${name}-${releaseVersion}.tgz`;
  const generatedPath = join(outDir, generatedName);
  if (existsSync(generatedPath)) renameSync(generatedPath, join(outDir, workflowName));
}

rmSync(stagingDir, { recursive: true, force: true });
console.log(`\nNPM tarballs for ${releaseVersion} written to ${outDir}`);

function sanitizeDependencies(dependencies) {
  if (!dependencies) return;
  for (const name of Object.keys(dependencies)) {
    if (name.startsWith('@ariana/')) {
      const packageName = name.replace('@ariana/', '');
      delete dependencies[name];
      dependencies[`${releaseScope}/${packageName}`] = releaseVersion;
      continue;
    }
    const version = dependencies[name];
    if (typeof version === 'string' && version.startsWith('file:../')) dependencies[name] = releaseVersion;
  }
}

function rewritePackageImports(directory) {
  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      rewritePackageImports(fullPath);
      continue;
    }
    if (!/\.(js|d\.ts|map)$/.test(entry)) continue;
    const content = readFileSync(fullPath, 'utf8')
      .replaceAll('@ariana/core', `${releaseScope}/core`)
      .replaceAll('@ariana/compiler', `${releaseScope}/compiler`)
      .replaceAll('@ariana/router', `${releaseScope}/router`)
      .replaceAll('@ariana/forms', `${releaseScope}/forms`)
      .replaceAll('@ariana/query', `${releaseScope}/query`)
      .replaceAll('@ariana/rendering', `${releaseScope}/rendering`)
      .replaceAll('@ariana/vite-plugin', `${releaseScope}/vite-plugin`);
    writeFileSync(fullPath, content);
  }
}

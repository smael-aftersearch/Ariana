import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const rootPackage = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const version = process.env.RELEASE_VERSION ?? rootPackage.version;
const outDir = join(root, 'npm-packages');
const manifestDir = join(root, 'release-manifests');
const manifestPath = join(manifestDir, `ariana-${version}-manifest.json`);
const checksumPath = join(manifestDir, `ariana-${version}-sha256.txt`);
const expectedPackages = ['core', 'compiler', 'router', 'forms', 'query', 'rendering', 'vite-plugin'];

if (!existsSync(manifestPath)) throw new Error(`Missing release manifest: ${manifestPath}`);
if (!existsSync(checksumPath)) throw new Error(`Missing release checksum file: ${checksumPath}`);

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const checksumText = readFileSync(checksumPath, 'utf8');
const checksumLines = checksumText.trim().split('\n').filter(Boolean);

if (manifest.version !== version) throw new Error(`Manifest version mismatch. Expected ${version}, received ${manifest.version}.`);
if (!Array.isArray(manifest.artifacts)) throw new Error('Manifest artifacts must be an array.');
if (manifest.artifacts.length !== expectedPackages.length) throw new Error(`Expected ${expectedPackages.length} artifacts, received ${manifest.artifacts.length}.`);

for (const packageName of expectedPackages) {
  const file = `ariana-${packageName}-${version}.tgz`;
  const packageId = `@ariana-framework/${packageName}`;
  const artifact = manifest.artifacts.find(item => item.package === packageId && item.file === file);
  if (!artifact) throw new Error(`Missing manifest entry for ${packageId}.`);

  const tarballPath = join(outDir, file);
  if (!existsSync(tarballPath)) throw new Error(`Missing tarball for manifest entry: ${file}`);

  const content = readFileSync(tarballPath);
  const actualSize = statSync(tarballPath).size;
  const actualSha = createHash('sha256').update(content).digest('hex');

  if (artifact.version !== version) throw new Error(`${file}: manifest version mismatch.`);
  if (artifact.sizeBytes !== actualSize) throw new Error(`${file}: size mismatch. Expected ${artifact.sizeBytes}, received ${actualSize}.`);
  if (artifact.sha256 !== actualSha) throw new Error(`${file}: sha256 mismatch.`);
  if (!checksumLines.includes(`${actualSha}  ${file}`)) throw new Error(`${file}: missing checksum line.`);

  console.log(`${file} verified.`);
}

console.log(`Release manifest verified for ${version}.`);

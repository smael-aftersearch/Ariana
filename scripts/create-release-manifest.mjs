import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const rootPackage = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const version = process.env.RELEASE_VERSION ?? rootPackage.version;
const outDir = join(root, 'npm-packages');
const manifestDir = join(root, 'release-manifests');
const manifestPath = join(manifestDir, `ariana-${version}-manifest.json`);
const checksumPath = join(manifestDir, `ariana-${version}-sha256.txt`);
const expectedPackages = ['core', 'compiler', 'router', 'forms', 'query', 'rendering', 'vite-plugin'];

if (!existsSync(outDir)) throw new Error('Missing npm-packages directory. Run pack first.');
mkdirSync(manifestDir, { recursive: true });

const tarballs = readdirSync(outDir).filter(name => name.endsWith('.tgz')).sort();
const entries = expectedPackages.map(name => {
  const fileName = `ariana-${name}-${version}.tgz`;
  if (!tarballs.includes(fileName)) throw new Error(`Missing release artifact: ${fileName}`);
  const filePath = join(outDir, fileName);
  const content = readFileSync(filePath);
  return {
    package: `@ariana-framework/${name}`,
    file: fileName,
    version,
    sizeBytes: statSync(filePath).size,
    sha256: createHash('sha256').update(content).digest('hex')
  };
});

const manifest = {
  name: 'Ariana release artifact manifest',
  version,
  generatedAt: new Date().toISOString(),
  artifacts: entries
};

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(checksumPath, entries.map(entry => `${entry.sha256}  ${entry.file}`).join('\n') + '\n');

console.log(`Release manifest written to ${manifestPath}`);
console.log(`SHA256 checksums written to ${checksumPath}`);

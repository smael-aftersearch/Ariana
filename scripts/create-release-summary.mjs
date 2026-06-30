import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const rootPackage = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const version = process.env.RELEASE_VERSION ?? rootPackage.version;
const manifestPath = join(root, 'release-manifests', `ariana-${version}-manifest.json`);
const summaryPath = join(root, 'release-manifests', `ariana-${version}-summary.md`);
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

const rows = manifest.artifacts.map(artifact => (
  `| ${artifact.package} | ${artifact.file} | ${formatBytes(artifact.sizeBytes)} | \`${artifact.sha256}\` |`
));

const summary = `# Ariana ${version} Release Artifact Summary

Generated from release manifest.

## Artifacts

| Package | File | Size | SHA256 |
| --- | --- | ---: | --- |
${rows.join('\n')}

## Verification

Run:

\`\`\`bash
RELEASE_VERSION=${version} node scripts/verify-release-manifest.mjs
\`\`\`

For downloaded artifacts, place tarballs and \`ariana-${version}-sha256.txt\` in the same directory and run:

\`\`\`bash
sha256sum -c ariana-${version}-sha256.txt
\`\`\`
`;

writeFileSync(summaryPath, summary);
console.log(`Release summary written to ${summaryPath}`);

function formatBytes(value) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KiB`;
  return `${(value / 1024 / 1024).toFixed(2)} MiB`;
}

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const rootPackage = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const releaseVersion = process.env.RELEASE_VERSION ?? rootPackage.version;
const releaseTag = process.env.NPM_DIST_TAG ?? 'next';
const packageNames = ['core', 'compiler', 'router', 'forms', 'query', 'rendering', 'vite-plugin'];
const scope = '@ariana-framework';

for (const name of packageNames) {
  const packageName = `${scope}/${name}`;
  const version = npmView(packageName, 'version');
  if (version !== releaseVersion) {
    throw new Error(`${packageName} latest version mismatch. Expected ${releaseVersion}, received ${version}.`);
  }

  const taggedVersion = npmView(packageName, `dist-tags.${releaseTag}`);
  if (taggedVersion !== releaseVersion) {
    throw new Error(`${packageName} ${releaseTag} tag mismatch. Expected ${releaseVersion}, received ${taggedVersion}.`);
  }

  console.log(`${packageName}@${releaseVersion} verified with dist-tag ${releaseTag}.`);
}

function npmView(packageName, field) {
  return execFileSync('npm', ['view', packageName, field], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  }).trim();
}

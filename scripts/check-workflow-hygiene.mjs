import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const workflowDir = join(root, '.github', 'workflows');
const hasPackageLock = existsSync(join(root, 'package-lock.json'));
const workflowFiles = readdirSync(workflowDir).filter(name => name.endsWith('.yml') || name.endsWith('.yaml')).sort();
const errors = [];
const releaseWorkflowPattern = /^release-v1-2-/;

for (const fileName of workflowFiles) {
  const filePath = join(workflowDir, fileName);
  const content = readFileSync(filePath, 'utf8');

  if (!hasPackageLock) {
    if (/\bnpm ci\b/.test(content)) errors.push(`${fileName}: npm ci requires a package-lock.json file.`);
    if (/cache:\s*npm/.test(content)) errors.push(`${fileName}: setup-node npm cache requires a npm lockfile.`);
  }

  if (/ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION/.test(content)) {
    errors.push(`${fileName}: do not opt into insecure/deprecated Node runtime versions.`);
  }

  if (releaseWorkflowPattern.test(fileName) && !/node-version:\s*22/.test(content)) {
    errors.push(`${fileName}: Ariana 1.2 release workflows must pin node-version: 22.`);
  }

  if (releaseWorkflowPattern.test(fileName) && /node-version:\s*20/.test(content)) {
    errors.push(`${fileName}: Ariana 1.2 release workflows must not use Node 20.`);
  }
}

if (errors.length > 0) {
  console.error('GitHub workflow hygiene check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`GitHub workflow hygiene check passed for ${workflowFiles.length} workflow files.`);

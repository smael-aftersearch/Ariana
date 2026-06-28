import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { run } from './lib/run-command.mjs';

const root = process.cwd();
const rootPackage = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const targetVersion = process.env.RELEASE_VERSION ?? rootPackage.version;
const env = { ...process.env, RELEASE_VERSION: targetVersion };

run('npm', ['run', 'pack:npm'], { env });
run('npm', ['run', 'inspect:tarballs'], { env });
console.log(`Ariana ${targetVersion} candidate tarballs are ready.`);

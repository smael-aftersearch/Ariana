import { run } from './lib/run-command.mjs';

const targetVersion = '1.0.0';
const env = { ...process.env, RELEASE_VERSION: targetVersion };

run('npm', ['run', 'pack:npm'], { env });
run('npm', ['run', 'inspect:tarballs'], { env });
console.log(`Ariana ${targetVersion} candidate tarballs are ready.`);

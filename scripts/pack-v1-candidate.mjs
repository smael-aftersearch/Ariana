import { execFileSync } from 'node:child_process';

const targetVersion = '1.0.0';
const env = { ...process.env, RELEASE_VERSION: targetVersion };

execFileSync('npm', ['run', 'pack:npm'], { stdio: 'inherit', env });
execFileSync('npm', ['run', 'inspect:tarballs'], { stdio: 'inherit', env });
console.log(`Ariana ${targetVersion} candidate tarballs are ready.`);

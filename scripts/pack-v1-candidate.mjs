import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const targetVersion = '1.0.0';
const packScript = 'scripts/pack-npm.mjs';
const inspectScript = 'scripts/inspect-tarballs.mjs';
const packOriginal = readFileSync(packScript, 'utf8');
const inspectOriginal = readFileSync(inspectScript, 'utf8');

const releaseVersionPattern = /const releaseVersion = '[^']+';/;

try {
  if (!releaseVersionPattern.test(packOriginal)) throw new Error('Could not find releaseVersion in pack script.');
  writeFileSync(packScript, packOriginal.replace(releaseVersionPattern, `const releaseVersion = '${targetVersion}';`));
  writeFileSync(inspectScript, inspectOriginal);
  execFileSync('npm', ['run', 'pack:npm'], { stdio: 'inherit' });
  execFileSync('npm', ['run', 'inspect:tarballs'], { stdio: 'inherit' });
  console.log(`Ariana ${targetVersion} candidate tarballs are ready.`);
} finally {
  writeFileSync(packScript, packOriginal);
  writeFileSync(inspectScript, inspectOriginal);
}

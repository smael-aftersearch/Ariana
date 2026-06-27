import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const packScript = 'scripts/pack-npm.mjs';
const inspectScript = 'scripts/inspect-tarballs.mjs';
const packOriginal = readFileSync(packScript, 'utf8');
const inspectOriginal = readFileSync(inspectScript, 'utf8');

try {
  writeFileSync(packScript, packOriginal.replace("const releaseVersion = '0.4.1';", "const releaseVersion = '0.5.0';"));
  writeFileSync(inspectScript, inspectOriginal.replace("const expectedVersion = '0.4.1';", "const expectedVersion = '0.5.0';"));
  execFileSync('npm', ['run', 'pack:npm'], { stdio: 'inherit' });
  execFileSync('npm', ['run', 'inspect:tarballs'], { stdio: 'inherit' });
} finally {
  writeFileSync(packScript, packOriginal);
  writeFileSync(inspectScript, inspectOriginal);
}

import { mkdtempSync, rmSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const packageDir = join(root, 'npm-packages');
const tarballs = readdirSync(packageDir).filter(name => name.endsWith('.tgz')).sort();

if (tarballs.length === 0) throw new Error('No package tarballs found.');

const temp = mkdtempSync(join(tmpdir(), 'ariana-smoke-'));

try {
  writeFileSync(join(temp, 'package.json'), JSON.stringify({ type: 'module', private: true }, null, 2));
  execFileSync('npm', ['install', '--silent', ...tarballs.map(name => join(packageDir, name))], { cwd: temp, stdio: 'inherit' });
  writeFileSync(join(temp, 'smoke.mjs'), "import { signal } from '@ariana/core';\nconst value = signal(1);\nif (value() !== 1) throw new Error('Package smoke test failed');\nconsole.log('Package install smoke test passed.');\n");
  execFileSync('node', ['smoke.mjs'], { cwd: temp, stdio: 'inherit' });
} finally {
  rmSync(temp, { recursive: true, force: true });
}

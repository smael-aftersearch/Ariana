import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const packageDir = join(root, 'npm-packages');
const appDir = mkdtempSync(join(tmpdir(), 'ariana-install-smoke-'));

try {
  execFileSync('npm', ['run', 'verify:release'], { cwd: root, stdio: 'inherit' });
  const tarballs = readdirSync(packageDir).filter(name => name.endsWith('.tgz')).map(name => resolve(packageDir, name));
  if (tarballs.length === 0) throw new Error('No npm tarballs found.');

  writeFileSync(join(appDir, 'package.json'), JSON.stringify({ type: 'module', scripts: { check: 'node index.mjs' } }, null, 2));
  execFileSync('npm', ['install', '--no-audit', '--no-fund', ...tarballs], { cwd: appDir, stdio: 'inherit' });

  writeFileSync(join(appDir, 'index.mjs'), `
import { signal, computed } from '@ariana-framework/core';
import { createRouter } from '@ariana-framework/router';
import { formControl } from '@ariana-framework/forms';
import { createQueryClient } from '@ariana-framework/query';
import { renderToString } from '@ariana-framework/rendering';

const count = signal(1);
const double = computed(() => count() * 2);
if (double() !== 2) throw new Error('core failed');

class Home {}
const router = createRouter([{ path: '/', component: Home }]);
if (!router.match('/')) throw new Error('router failed');

const control = formControl('ok');
if (control.value() !== 'ok') throw new Error('forms failed');

const query = createQueryClient(() => 1);
query.set('x', 1);
if (query.get('x')?.data() !== 1) throw new Error('query failed');

const html = renderToString('<main>Ariana</main>');
if (!html.includes('Ariana')) throw new Error('rendering failed');

console.log('Ariana install smoke test passed.');
`);

  execFileSync('npm', ['run', 'check'], { cwd: appDir, stdio: 'inherit' });
} finally {
  rmSync(appDir, { recursive: true, force: true });
}

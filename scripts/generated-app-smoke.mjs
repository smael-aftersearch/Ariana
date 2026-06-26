import { mkdtempSync, readdirSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const outDir = join(root, 'npm-packages');
const appDir = mkdtempSync(join(tmpdir(), 'ariana-generated-app-'));

try {
  execFileSync('npm', ['run', 'pack:npm'], { cwd: root, stdio: 'inherit' });
  const tarballs = readdirSync(outDir).filter(name => name.endsWith('.tgz')).map(name => resolve(outDir, name));

  mkdirSync(join(appDir, 'src'), { recursive: true });
  writeFileSync(join(appDir, 'package.json'), JSON.stringify({
    name: 'ariana-generated-app-smoke',
    private: true,
    type: 'module',
    scripts: { build: 'vite build' },
    dependencies: {},
    devDependencies: { vite: '^7.0.0', typescript: '^5.8.3' }
  }, null, 2));
  writeFileSync(join(appDir, 'index.html'), '<main id="app">Ariana</main><script type="module" src="/src/main.ts"></script>\n');
  writeFileSync(join(appDir, 'src', 'main.ts'), `
import { computed, signal } from '@ariana-framework/core';
import { createRouter } from '@ariana-framework/router';
import { formArray, formControl } from '@ariana-framework/forms';
import { createQueryClient } from '@ariana-framework/query';

class HomePage {}
const value = signal(2);
const double = computed(() => value() * 2);
const router = createRouter([{ path: '/', component: HomePage }]);
const names = formArray([formControl('Ariana')]);
const query = createQueryClient(() => 1);
query.set('framework:name', names.value()[0]);

if (!router.match('/')) throw new Error('Router smoke failed.');
if (names.value()[0] !== 'Ariana') throw new Error('Forms smoke failed.');
if (query.get('framework:name')?.data() !== 'Ariana') throw new Error('Query smoke failed.');

document.querySelector('#app')!.textContent = 'Ariana ' + double();
`);
  writeFileSync(join(appDir, 'vite.config.ts'), "import { defineConfig } from 'vite';\nimport { ariana } from '@ariana-framework/vite-plugin';\nexport default defineConfig({ plugins: [ariana()] });\n");

  execFileSync('npm', ['install', '--no-audit', '--no-fund', ...tarballs], { cwd: appDir, stdio: 'inherit' });
  execFileSync('npm', ['run', 'build'], { cwd: appDir, stdio: 'inherit' });
  console.log('Generated app smoke test passed.');
} finally {
  rmSync(appDir, { recursive: true, force: true });
}

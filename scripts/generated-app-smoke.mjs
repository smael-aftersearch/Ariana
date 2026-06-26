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
  writeFileSync(join(appDir, 'src', 'main.ts'), "import { computed, signal } from '@ariana-framework/core';\nconst value = signal(2);\nconst double = computed(() => value() * 2);\ndocument.querySelector('#app')!.textContent = 'Ariana ' + double();\n");
  writeFileSync(join(appDir, 'vite.config.ts'), "import { defineConfig } from 'vite';\nimport { ariana } from '@ariana-framework/vite-plugin';\nexport default defineConfig({ plugins: [ariana()] });\n");

  execFileSync('npm', ['install', '--no-audit', '--no-fund', ...tarballs], { cwd: appDir, stdio: 'inherit' });
  execFileSync('npm', ['run', 'build'], { cwd: appDir, stdio: 'inherit' });
  console.log('Generated app smoke test passed.');
} finally {
  rmSync(appDir, { recursive: true, force: true });
}

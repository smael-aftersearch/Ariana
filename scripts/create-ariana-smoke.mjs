import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const source = readFileSync(join(process.cwd(), 'packages', 'create-ariana', 'src', 'index.ts'), 'utf8');
const requiredFragments = [
  '@ariana-framework/core',
  '@ariana-framework/router',
  '@ariana-framework/forms',
  '@ariana-framework/query',
  '@ariana-framework/vite-plugin',
  'vite.config.ts',
  'src',
  'main.ts'
];

for (const fragment of requiredFragments) {
  if (!source.includes(fragment)) throw new Error(`create-ariana source is missing ${fragment}.`);
}

const appDir = join(tmpdir(), `ariana-cli-smoke-${Date.now()}`);
try {
  mkdirSync(join(appDir, 'src'), { recursive: true });
  writeFileSync(join(appDir, 'package.json'), JSON.stringify({
    name: 'ariana-cli-smoke',
    private: true,
    type: 'module',
    scripts: { build: 'vite build' },
    dependencies: {
      '@ariana-framework/core': '^0.5.0',
      '@ariana-framework/router': '^0.5.0',
      '@ariana-framework/forms': '^0.5.0',
      '@ariana-framework/query': '^0.5.0'
    },
    devDependencies: { '@ariana-framework/vite-plugin': '^0.5.0', vite: '^7.0.0', typescript: '^5.8.3' }
  }, null, 2));
  writeFileSync(join(appDir, 'index.html'), '<main id="app">Ariana App</main><script type="module" src="/src/main.ts"></script>\n');
  writeFileSync(join(appDir, 'src', 'main.ts'), "import { signal } from '@ariana-framework/core';\nconst count = signal(1);\nconsole.log(count());\n");
  writeFileSync(join(appDir, 'vite.config.ts'), "import { defineConfig } from 'vite';\nimport { ariana } from '@ariana-framework/vite-plugin';\nexport default defineConfig({ plugins: [ariana()] });\n");

  for (const file of ['package.json', 'index.html', 'src/main.ts', 'vite.config.ts']) {
    if (!existsSync(join(appDir, file))) throw new Error(`Missing generated file: ${file}`);
  }

  console.log('create-ariana smoke test passed.');
} finally {
  rmSync(appDir, { recursive: true, force: true });
}

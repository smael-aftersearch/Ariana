#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const appName = process.argv[2] ?? 'ariana-app';
const targetDir = join(process.cwd(), appName);
const arianaVersion = '^0.5.0';

mkdirSync(join(targetDir, 'src'), { recursive: true });
writeFileSync(join(targetDir, 'package.json'), `${JSON.stringify({
  name: appName,
  private: true,
  type: 'module',
  scripts: { dev: 'vite', build: 'vite build' },
  dependencies: {
    '@ariana-framework/core': arianaVersion,
    '@ariana-framework/router': arianaVersion,
    '@ariana-framework/forms': arianaVersion,
    '@ariana-framework/query': arianaVersion
  },
  devDependencies: { '@ariana-framework/vite-plugin': arianaVersion, vite: '^7.0.0', typescript: '^5.8.3' }
}, null, 2)}\n`);
writeFileSync(join(targetDir, 'index.html'), '<main id="app">Ariana App</main><script type="module" src="/src/main.ts"></script>\n');
writeFileSync(join(targetDir, 'src', 'main.ts'), `import { computed, signal } from '@ariana-framework/core';\nimport { createRouter } from '@ariana-framework/router';\nimport { formArray, formControl } from '@ariana-framework/forms';\nimport { createQueryClient } from '@ariana-framework/query';\n\nclass HomePage {}\nconst count = signal(1);\nconst double = computed(() => count() * 2);\nconst router = createRouter([{ path: '/', component: HomePage }]);\nconst names = formArray([formControl('Ariana')]);\nconst query = createQueryClient();\nquery.set('framework:name', names.value()[0]);\n\nif (!router.match('/')) throw new Error('Router setup failed.');\n\ndocument.querySelector('#app')!.textContent = 'Ariana App ' + double();\n`);
writeFileSync(join(targetDir, 'vite.config.ts'), `import { defineConfig } from 'vite';\nimport { ariana } from '@ariana-framework/vite-plugin';\n\nexport default defineConfig({ plugins: [ariana()] });\n`);
console.log(`Created ${appName}.`);

import { mkdtempSync, readdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { run } from './lib/run-command.mjs';

const root = process.cwd();
const version = process.env.RELEASE_VERSION ?? JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
const packageNames = ['core', 'compiler', 'router', 'forms', 'query', 'rendering', 'vite-plugin'];
const outDir = join(root, 'npm-packages');
const tempDir = mkdtempSync(join(tmpdir(), 'ariana-smoke-'));

try {
  const files = readdirSync(outDir);
  const tarballs = packageNames.map(name => {
    const file = files.find(item => item === `ariana-${name}-${version}.tgz`);
    if (!file) throw new Error(`Missing tarball: ariana-${name}-${version}.tgz`);
    return resolve(outDir, file);
  });

  writeFileSync(join(tempDir, 'package.json'), `${JSON.stringify({ private: true, type: 'module' }, null, 2)}\n`);
  run('npm', ['install', '--no-audit', '--no-fund', ...tarballs], { cwd: tempDir });

  for (const name of packageNames) {
    const packageJsonPath = join(tempDir, 'node_modules', '@ariana-framework', name, 'package.json');
    const metadata = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const expectedName = `@ariana-framework/${name}`;
    if (metadata.name !== expectedName) throw new Error(`${expectedName}: installed package name mismatch.`);
    if (metadata.version !== version) throw new Error(`${expectedName}: installed package version mismatch.`);
    if (metadata.type !== 'module') throw new Error(`${expectedName}: package type must be module.`);
    if (!metadata.exports) throw new Error(`${expectedName}: package exports are missing.`);
  }

  writeFileSync(join(tempDir, 'smoke.mjs'), `
import { signal, computed } from '@ariana-framework/core';
import { createRouter, normalizeRouteTransition } from '@ariana-framework/router';

const value = signal(2);
const total = computed(() => value() + 3);
value.set(7);
if (total() !== 10) throw new Error('core import smoke failed');

class Page {}
const router = createRouter([{ path: '/', component: Page, transition: { enter: 'route-enter', leave: 'route-leave' } }], '/');
if (!router.match('/')) throw new Error('router import smoke failed');
const transition = normalizeRouteTransition(router.currentTransition());
if (transition.enter[0] !== 'route-enter') throw new Error('transition import smoke failed');

console.log('Packed candidate smoke passed.');
`);
  run('node', ['smoke.mjs'], { cwd: tempDir });
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}

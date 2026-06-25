import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const outDir = join(root, 'npm-packages');
const packages = ['core', 'compiler', 'router', 'forms', 'query', 'rendering', 'vite-plugin'];

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const name of packages) {
  const cwd = join(root, 'packages', name);
  console.log(`Packing @ariana/${name}...`);
  execFileSync('npm', ['pack', '--pack-destination', outDir], { cwd, stdio: 'inherit' });
}

console.log(`\nNPM tarballs written to ${outDir}`);

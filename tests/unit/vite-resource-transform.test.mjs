import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { ariana } from '../../packages/vite-plugin/dist/index.js';
import { test, assert } from './test-api.mjs';

test('vite plugin: transforms component templateUrl and styleUrl into runtime metadata', async () => {
  const dir = join(tmpdir(), `ari-vite-transform-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  try {
    writeFileSync(join(dir, 'cmp.html'), '<p>Hello {{ title }}</p>');
    writeFileSync(join(dir, 'cmp.css'), 'p { display: block; }');
    const source = `
      import { Component } from '@ariana-framework/core';
      Component({ selector: 'x-cmp', templateUrl: './cmp.html', styleUrl: './cmp.css' })(class Cmp { title = 'Ariana'; });
    `;
    const plugin = ariana({ compileTemplates: false });
    const output = await plugin.transform?.(source, join(dir, 'cmp.ts'));
    assert(typeof output === 'string', 'transform should return code');
    assert(output.includes('template:'), 'templateUrl should become template metadata');
    assert(output.includes('style:'), 'styleUrl should become style metadata');
    assert(!output.includes('templateUrl'), 'templateUrl should be removed from transformed metadata');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

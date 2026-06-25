import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ariana } from '../../packages/vite-plugin/dist/index.js';
import { test, assert } from './test-runner.mjs';

function withTempProject(callback) {
  const directory = mkdtempSync(join(tmpdir(), 'ariana-vite-plugin-'));
  try {
    return callback(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('vite plugin uses compiler diagnostics and compiles valid templates', () => {
  withTempProject(directory => {
    writeFileSync(join(directory, 'cmp.html'), '<p>Hello {{ name }}</p>');
    writeFileSync(join(directory, 'cmp.css'), 'p { display: block; }');

    const source = `
      import { Component } from '@ariana/core';
      @Component({
        selector: 'x-test',
        templateUrl: './cmp.html',
        styleUrl: './cmp.css'
      })
      export class TestCmp { name = 'Ariana'; }
    `;

    const plugin = ariana();
    const transformed = plugin.transform(source, join(directory, 'cmp.ts'));
    assert(typeof transformed === 'string');
    assert(transformed.includes('render: function __ari_render'));
    assert(transformed.includes('style:'));
  });
});

test('vite plugin rejects invalid templates in strict mode', () => {
  withTempProject(directory => {
    writeFileSync(join(directory, 'bad.html'), '<p>{{ name }</p>');
    const source = `
      import { Component } from '@ariana/core';
      @Component({ selector: 'x-bad', templateUrl: './bad.html' })
      export class BadCmp { name = 'Ariana'; }
    `;

    const plugin = ariana({ strictTemplates: true });
    let failed = false;
    try {
      plugin.transform(source, join(directory, 'bad.ts'));
    } catch (error) {
      failed = true;
      assert(String(error.message).includes('ARI_UNCLOSED_INTERPOLATION'));
    }
    assert(failed, 'expected strict template diagnostics to fail transform');
  });
});

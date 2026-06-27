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

test('vite plugin: keeps decorator syntax valid during transform', async () => {
  const dir = join(tmpdir(), `ari-vite-decorator-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  try {
    writeFileSync(join(dir, 'cmp.html'), '<p>Hello {{ title }}</p>');
    const source = `
      import { Component } from '@ariana-framework/core';
      @Component({ selector: 'x-cmp', templateUrl: './cmp.html' })
      class Cmp { title = 'Ariana'; }
    `;
    const plugin = ariana({ compileTemplates: false });
    const output = await plugin.transform?.(source, join(dir, 'cmp.ts'));
    assert(typeof output === 'string', 'decorator transform should return code');
    assert(output.includes('@Component({'), 'decorator prefix should be preserved');
    assert(output.includes('template:'), 'templateUrl should become template metadata');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('vite plugin: typeCheckTemplates reports unknown interpolation roots when members are provided', async () => {
  const dir = join(tmpdir(), `ari-vite-typecheck-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  try {
    writeFileSync(join(dir, 'cmp.html'), '<p>{{ missingTitle }}</p>');
    const source = `
      import { Component } from '@ariana-framework/core';
      Component({ selector: 'x-cmp', templateUrl: './cmp.html' })(class Cmp {});
    `;
    const plugin = ariana({ compileTemplates: false, typeCheckTemplates: true, templateTypeCheckMembers: ['title'] });
    let failed = false;
    try {
      await plugin.transform?.(source, join(dir, 'cmp.ts'));
    } catch (error) {
      failed = String(error).includes('ARI_TYPE_UNKNOWN_MEMBER');
    }
    assert(failed, 'unknown template member should fail strict typecheck');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('vite plugin: uses compiler-owned inferred members from component class source', async () => {
  const dir = join(tmpdir(), `ari-vite-infer-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  try {
    writeFileSync(join(dir, 'cmp.html'), '<p>{{ title }} {{ label }}</p><button (click)="save($event)">Save</button>');
    const source = `
      import { Component } from '@ariana-framework/core';
      Component({ selector: 'x-cmp', templateUrl: './cmp.html' })(class Cmp { title = 'Ariana'; get label() { return this.title; } save() {} });
    `;
    const plugin = ariana({ compileTemplates: false, typeCheckTemplates: true });
    const output = await plugin.transform?.(source, join(dir, 'cmp.ts'));
    assert(typeof output === 'string', 'compiler-owned inferred typecheck members should allow valid template members');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

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
      failed = String(error).includes('ARI_TYPE_UNKNOWN_MEMBER') && String(error).includes('cmp.html:1:1');
    }
    assert(failed, 'unknown template member should fail strict typecheck with formatted location');
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
      Component({ selector: 'x-cmp', templateUrl: './cmp.html' })(class Cmp { title = 'Ariana'; get label() { return this.title; } save(event?: Event) {} });
    `;
    const plugin = ariana({ compileTemplates: false, typeCheckTemplates: true });
    const output = await plugin.transform?.(source, join(dir, 'cmp.ts'));
    assert(typeof output === 'string', 'compiler-owned inferred typecheck members should allow valid template members');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('vite plugin: uses source-based typed symbols for type-aware template errors', async () => {
  const dir = join(tmpdir(), `ari-vite-symbols-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  try {
    writeFileSync(join(dir, 'cmp.html'), '<p>{{ user.missingName }}</p>');
    const source = `
      import { Component } from '@ariana-framework/core';
      Component({ selector: 'x-cmp', templateUrl: './cmp.html' })(class Cmp { user: { name: string } = { name: 'Ariana' }; });
    `;
    const plugin = ariana({ compileTemplates: false, typeCheckTemplates: true });
    let failed = false;
    try {
      await plugin.transform?.(source, join(dir, 'cmp.ts'));
    } catch (error) {
      failed = String(error).includes('ARI_TYPE_UNKNOWN_PROPERTY') && String(error).includes('user.missingName');
    }
    assert(failed, 'typed source symbols should report unknown property diagnostics');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('vite plugin: strictWarnings escalates parser warnings', async () => {
  const dir = join(tmpdir(), `ari-vite-warnings-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  try {
    writeFileSync(join(dir, 'cmp.html'), '<button (click)="function inline() {}">Save</button>');
    const source = `
      import { Component } from '@ariana-framework/core';
      Component({ selector: 'x-cmp', templateUrl: './cmp.html' })(class Cmp {});
    `;
    const plugin = ariana({ compileTemplates: false, strictWarnings: true });
    let failed = false;
    try {
      await plugin.transform?.(source, join(dir, 'cmp.ts'));
    } catch (error) {
      failed = String(error).includes('ARI_UNSUPPORTED_BINDING_EXPRESSION');
    }
    assert(failed, 'strictWarnings should escalate template parser warnings');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('vite plugin: transforms multiple components in one source file', async () => {
  const dir = join(tmpdir(), `ari-vite-multi-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  try {
    writeFileSync(join(dir, 'first.html'), '<p>{{ first }}</p>');
    writeFileSync(join(dir, 'second.html'), '<p>{{ second }}</p>');
    const source = `
      import { Component } from '@ariana-framework/core';
      Component({ selector: 'x-first', templateUrl: './first.html' })(class First { first = 'one'; });
      @Component({ selector: 'x-second', templateUrl: './second.html' })
      class Second { second = 'two'; }
    `;
    const plugin = ariana({ compileTemplates: false });
    const output = await plugin.transform?.(source, join(dir, 'multi.ts'));
    assert(typeof output === 'string', 'multi component transform should return code');
    assert(output.includes('first.html?raw'), 'first template raw import should exist');
    assert(output.includes('second.html?raw'), 'second template raw import should exist');
    assert(!output.includes('templateUrl'), 'all templateUrl metadata should be transformed');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('vite plugin: supports nested metadata objects during transform', async () => {
  const dir = join(tmpdir(), `ari-vite-nested-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  try {
    writeFileSync(join(dir, 'cmp.html'), '<p>{{ title }}</p>');
    const source = `
      import { Component } from '@ariana-framework/core';
      Component({ selector: 'x-cmp', providers: [{ token: 'x', useValue: { nested: true } }], templateUrl: './cmp.html' })(class Cmp { title = 'Ariana'; });
    `;
    const plugin = ariana({ compileTemplates: false });
    const output = await plugin.transform?.(source, join(dir, 'cmp.ts'));
    assert(typeof output === 'string', 'nested metadata transform should return code');
    assert(output.includes('providers:'), 'nested metadata should be preserved');
    assert(output.includes('template:'), 'templateUrl should be transformed');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('vite plugin: reports missing template resources with Ariana resource error', async () => {
  const dir = join(tmpdir(), `ari-vite-missing-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  try {
    const source = `
      import { Component } from '@ariana-framework/core';
      Component({ selector: 'x-cmp', templateUrl: './missing.html' })(class Cmp {});
    `;
    const plugin = ariana({ compileTemplates: false });
    let failed = false;
    try {
      await plugin.transform?.(source, join(dir, 'cmp.ts'));
    } catch (error) {
      failed = String(error).includes('Ariana resource error') && String(error).includes('missing.html');
    }
    assert(failed, 'missing resource should produce Ariana resource error');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

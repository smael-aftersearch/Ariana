import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { ariana } from '../packages/vite-plugin/dist/index.js';

const dir = mkdtempSync(join(tmpdir(), 'ariana-vite-options-smoke-'));

try {
  mkdirSync(join(dir, 'src'), { recursive: true });
  writeFileSync(join(dir, 'src', 'cmp.html'), '<p>{{ user.name }}</p><button (click)="save(1)">Save</button>');
  writeFileSync(join(dir, 'src', 'cmp.css'), 'p { display: block; }');

  const source = `
    import { Component } from '@ariana-framework/core';
    Component({ selector: 'x-cmp', templateUrl: './cmp.html', styleUrl: './cmp.css' })(class Cmp {
      user: { name: string } = { name: 'Ariana' };
      save(id: number) {}
    });
  `;

  const plugin = ariana({
    compileTemplates: false,
    typeCheckTemplates: true,
    strictTemplates: true,
    strictWarnings: true,
    templateTypeCheckMembers: ['externalMember'],
    templateTypeCheckSymbols: {
      externalMember: { kind: 'value' }
    }
  });

  const output = await plugin.transform?.(source, join(dir, 'src', 'cmp.ts'));
  if (typeof output !== 'string') throw new Error('Expected Vite plugin transform output.');
  if (!output.includes('template:')) throw new Error('Expected template metadata transform.');
  if (!output.includes('style:')) throw new Error('Expected style metadata transform.');
  if (output.includes('templateUrl')) throw new Error('templateUrl should not remain after transform.');
  if (output.includes('styleUrl')) throw new Error('styleUrl should not remain after transform.');

  console.log('Vite plugin options smoke passed.');
} finally {
  rmSync(dir, { recursive: true, force: true });
}

import { typeCheckTemplate } from '../../packages/compiler/dist/typecheck.js';
import { test, equal } from './test-api.mjs';

test('compiler typecheck accepts known component members', () => {
  const result = typeCheckTemplate('<h1>{{ title }}</h1><button (click)="save()">Save</button>', { members: ['title', 'save'] });
  equal(result.diagnostics.length, 0);
});

test('compiler typecheck reports unknown members', () => {
  const result = typeCheckTemplate('<h1>{{ missingTitle }}</h1>', { members: ['title'] });
  equal(result.diagnostics[0].code, 'ARI_TYPE_UNKNOWN_MEMBER');
});

test('compiler typecheck respects for block item scope', () => {
  const result = typeCheckTemplate('@for (item of items(); track item.id) { <span>{{ item.title }}</span> }', { members: ['items'] });
  equal(result.diagnostics.length, 0);
});

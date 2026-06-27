import { inferComponentContextMembers, mergeTypeCheckMembers, typeCheckTemplate } from '../../packages/compiler/dist/typecheck.js';
import { test, equal, assert } from './test-api.mjs';

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

test('compiler typecheck exposes $index inside for block scope', () => {
  const result = typeCheckTemplate('@for (item of items()) { <span>{{ $index }} {{ item.title }}</span> }', { members: ['items'] });
  equal(result.diagnostics.length, 0);
});

test('compiler typecheck exposes $event inside event bindings', () => {
  const result = typeCheckTemplate('<button (click)="save($event)">Save</button>', { members: ['save'] });
  equal(result.diagnostics.length, 0);
});

test('compiler typecheck allows safe expression globals', () => {
  const result = typeCheckTemplate('<p>{{ Math.max(count(), 1) }}</p>', { members: ['count'] });
  equal(result.diagnostics.length, 0);
});

test('compiler infers component fields methods and accessors from class source', () => {
  const result = inferComponentContextMembers(`
    class Page {
      title = 'Ariana';
      saving: boolean = false;
      get label() { return this.title; }
      save() {}
    }
  `);
  for (const member of ['title', 'saving', 'label', 'save']) {
    assert(result.members.includes(member), `missing inferred member ${member}`);
  }
});

test('compiler merges explicit and inferred typecheck members', () => {
  const result = mergeTypeCheckMembers(['title', 'save'], ['title', 'label']);
  equal(result.join(','), 'title,save,label');
});

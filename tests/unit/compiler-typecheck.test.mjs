import { createTypeCheckContextFromSource, inferComponentContextMembers, inferComponentTypeSymbols, mergeTypeCheckMembers, typeCheckTemplate } from '../../packages/compiler/dist/typecheck.js';
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

test('compiler typecheck reports unknown typed object properties', () => {
  const result = typeCheckTemplate('<p>{{ user.missingName }}</p>', {
    members: [],
    symbols: {
      user: { kind: 'object', properties: { name: { kind: 'value' } } }
    }
  });
  equal(result.diagnostics[0].code, 'ARI_TYPE_UNKNOWN_PROPERTY');
});

test('compiler typecheck reports calling non-method members', () => {
  const result = typeCheckTemplate('<button (click)="title()">Save</button>', {
    members: [],
    symbols: { title: { kind: 'value' } }
  });
  equal(result.diagnostics[0].code, 'ARI_TYPE_CALL_NON_METHOD');
});

test('compiler typecheck reports method argument count violations', () => {
  const result = typeCheckTemplate('<button (click)="save()">Save</button>', {
    members: [],
    symbols: { save: { kind: 'method', minArgs: 1, maxArgs: 1 } }
  });
  equal(result.diagnostics[0].code, 'ARI_TYPE_METHOD_ARGUMENT_COUNT');
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

test('compiler infers typed symbols from component source', () => {
  const result = inferComponentTypeSymbols(`
    class Page {
      user: { name: string } = { name: 'Ariana' };
      items: string[] = [];
      save(id: string, force?: boolean) {}
    }
  `);
  equal(result.symbols.user.kind, 'object');
  assert(result.symbols.user.properties.name, 'inline object property should be inferred');
  equal(result.symbols.items.kind, 'array');
  equal(result.symbols.save.kind, 'method');
  equal(result.symbols.save.minArgs, 1);
  equal(result.symbols.save.maxArgs, 2);
});

test('compiler creates typecheck context from source', () => {
  const context = createTypeCheckContextFromSource(`class Page { title = 'Ariana'; save(id: string) {} }`, ['external']);
  assert(context.members.includes('title'), 'source member should be included');
  assert(context.members.includes('external'), 'explicit member should be included');
  equal(context.symbols.save.kind, 'method');
});

test('compiler merges explicit and inferred typecheck members', () => {
  const result = mergeTypeCheckMembers(['title', 'save'], ['title', 'label']);
  equal(result.join(','), 'title,save,label');
});

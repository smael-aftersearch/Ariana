# Ariana List Signal

`listSignal()` is a targeted list primitive for Ariana.

The previous compiled `@for` work reduced DOM recreation, but the list effect still scanned the whole list whenever the source array changed. `listSignal()` is the first step toward list-level scheduling.

---

## Goal

`listSignal()` keeps the normal signal shape while adding targeted list change events.

```ts
const users = listSignal(initialUsers, user => user.id);

users.updateByKey(42, user => ({
  ...user,
  active: !user.active
}));
```

A normal read still returns the full array:

```ts
users();
```

Code that needs targeted updates can subscribe to list changes:

```ts
users.subscribeChanges(change => {
  if (change.type === 'update') {
    console.log(change.key, change.index, change.item);
  }
});
```

---

## Supported operations

- `set(items)`
- `update(updater)`
- `updateByKey(key, updater)`
- `insert(item, index?)`
- `removeByKey(key)`
- `clear()`
- `getByKey(key)`
- `indexOfKey(key)`
- `subscribeChanges(subscriber)`

---

## Why this matters

Compiled `@for` can use this primitive later to avoid scanning every row when the mutation shape is known.

This preview does not yet wire `listSignal()` directly into generated `@for` code. It adds the runtime primitive and a benchmark proving the scheduling direction.

---

## Current limits

- Generated `@for` still uses the normal signal path.
- `listSignal()` emits targeted events, but compiler integration is the next step.
- Bulk operations still need better event grouping.

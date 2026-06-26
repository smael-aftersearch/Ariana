# Forms FormArray Design

Ariana forms need array-based controls for dynamic enterprise forms.

## Goals

- support dynamic lists of controls
- preserve signal-based state
- aggregate validity
- support add/remove/move operations
- support nested groups and arrays later

## Proposed API

```ts
const aliases = formArray([
  formControl('admin'),
  formControl('owner')
]);

aliases.push(formControl('editor'));
aliases.removeAt(0);
```

## Required state

- value
- valid
- errors
- touched
- dirty
- pending
- length

## Required tests

- push control updates value
- remove control updates value
- child invalid state updates array validity
- async child validation affects pending state
- reset restores state

## Non-goals for first version

- schema-driven forms
- template-only form definitions
- uncontrolled global validation cycles

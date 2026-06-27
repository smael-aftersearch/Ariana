# Compiler Diagnostics Registry

This registry lists compiler and template typecheck diagnostic codes that are part of the version one stabilization path.

## Diagnostic shape

Every diagnostic should include:

- `level`
- `code`
- `message`
- `index`
- `location.line`
- `location.column`

## Parse diagnostics

| Code | Level | Meaning | Example |
| --- | --- | --- | --- |
| `ARI_UNCLOSED_INTERPOLATION` | error | Interpolation is missing closing braces. | `{{ title` |
| `ARI_EMPTY_INTERPOLATION` | error | Interpolation expression is empty. | `{{ }}` |
| `ARI_UNCLOSED_ELEMENT` | error | Element is missing a closing angle bracket. | `<div` |
| `ARI_INVALID_ELEMENT` | error | Element tag is invalid. | `<123>` |
| `ARI_MISSING_CLOSE_TAG` | error | Element is missing a matching close tag. | `<section><p></section>` |
| `ARI_INVALID_IF` | error | `@if` control block is malformed. | `@if visible { ... }` |
| `ARI_INVALID_FOR` | error | `@for` control block is malformed. | `@for item of items { ... }` |
| `ARI_UNKNOWN_BINDING` | warning | Binding syntax starts like a binding but does not match a known category. | `[foo.bar]="x"` |
| `ARI_INVALID_FOR_EXPRESSION` | error | `@for` expression does not match the supported item-of-iterable grammar. | `@for (items) { ... }` |
| `ARI_EMPTY_BINDING_EXPRESSION` | error | A property, event, or class binding has no expression. | `(click)=""` |
| `ARI_UNSUPPORTED_BINDING_EXPRESSION` | warning | Binding expression uses a syntax shape that Ariana does not support yet. | `(click)="() => save()"` |

## Typecheck diagnostics

| Code | Level | Meaning | Example |
| --- | --- | --- | --- |
| `ARI_TYPE_UNKNOWN_MEMBER` | error | Template expression references a member that is not known in the component context. | `{{ missingTitle }}` |

## Version one rule

Before version one, every diagnostic code must have:

- stable code name
- severity
- documentation
- parser or typecheck test
- example input
- migration note if renamed

# Compiler Diagnostics Registry

This registry lists compiler and template typecheck diagnostic codes that are part of the version one stabilization path.

## Parse diagnostics

| Code | Level | Meaning |
| --- | --- | --- |
| `ARI_UNCLOSED_INTERPOLATION` | error | Interpolation is missing closing braces. |
| `ARI_UNCLOSED_ELEMENT` | error | Element is missing a closing angle bracket. |
| `ARI_INVALID_ELEMENT` | error | Element tag is invalid. |
| `ARI_MISSING_CLOSE_TAG` | error | Element is missing a matching close tag. |
| `ARI_INVALID_IF` | error | `@if` control block is malformed. |
| `ARI_INVALID_FOR` | error | `@for` control block is malformed. |

## Typecheck diagnostics

| Code | Level | Meaning |
| --- | --- | --- |
| `ARI_TYPE_UNKNOWN_MEMBER` | error | Template expression references a member that is not known in the component context. |

## Version one rule

Before version one, every diagnostic code must have:

- stable code name
- severity
- documentation
- parser or typecheck test
- example input
- migration note if renamed

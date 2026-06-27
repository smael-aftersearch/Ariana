# Ariana Error Codes

Ariana diagnostics should use stable error codes.

## Compiler diagnostics

| Code | Meaning |
| --- | --- |
| ARI_UNCLOSED_INTERPOLATION | An interpolation expression was not closed. |
| ARI_EMPTY_INTERPOLATION | An interpolation expression is empty. |
| ARI_UNCLOSED_ELEMENT | An element was not closed. |
| ARI_INVALID_ELEMENT | Element syntax is invalid. |
| ARI_MISSING_CLOSE_TAG | A required closing tag is missing. |
| ARI_INVALID_IF | `@if` block syntax is invalid. |
| ARI_INVALID_FOR | `@for` block syntax is invalid. |
| ARI_UNKNOWN_BINDING | Binding category is unknown. |
| ARI_INVALID_FOR_EXPRESSION | `@for` expression is invalid. |
| ARI_EMPTY_BINDING_EXPRESSION | A binding expression is empty. |
| ARI_UNSUPPORTED_BINDING_EXPRESSION | A binding expression uses an unsupported inline expression shape. |
| ARI_TYPE_UNKNOWN_MEMBER | Template type checking found a member that is not declared in the component context. |
| ARI_TYPE_UNKNOWN_PROPERTY | Template type checking found a property that is not declared on a typed object symbol. |
| ARI_TYPE_CALL_NON_METHOD | Template type checking found a call against a known non-method member. |
| ARI_TYPE_METHOD_ARGUMENT_COUNT | Template type checking found a method call with an invalid argument count. |

## Diagnostic shape

Compiler diagnostics should include:

- code
- level
- message
- index
- line and column location when available

## Policy

- compiler errors should fail strict builds
- warnings should not block development builds unless configured
- every new diagnostic must be documented here
- every diagnostic must have at least one test

# Ariana Deprecation Policy

Ariana is pre-1.0, but deprecations should still be handled clearly.

## Deprecation rules

- mark deprecated APIs in docs
- add migration notes
- keep deprecated APIs for at least one minor release when practical
- avoid silent behavior changes
- add tests for compatibility where needed

## Removal rules

Before removing a documented API:

1. document the replacement
2. add changelog entry
3. add migration guidance
4. remove only in a version where breaking changes are expected

## Compiler diagnostics

Deprecated template syntax should produce a diagnostic before removal.

## Runtime warnings

Runtime warnings should be used sparingly and only for user-facing APIs.

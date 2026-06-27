# Diagnostic Migration Notes for Version One

This document freezes migration expectations for compiler and Vite diagnostics on the version-one path.

## Stable code rule

Diagnostic code names should not be renamed after version one without a migration note.

## Current code families

- `ARI_UNCLOSED_*`: parser structural errors
- `ARI_EMPTY_*`: parser expression errors
- `ARI_INVALID_*`: malformed syntax errors
- `ARI_UNKNOWN_*`: unknown syntax or unknown member diagnostics
- `ARI_TYPE_*`: template typecheck diagnostics

## Vite migration notes

- Vite template parse errors are formatted through compiler diagnostics.
- Vite template typecheck errors are formatted through compiler diagnostics.
- `strictWarnings` can escalate warnings into blocking Vite errors.
- `templateTypeCheckSymbols` can add explicit type metadata for Vite template checks.

## Version one rule

If a diagnostic code changes before version one, this file must document:

- old code
- new code
- reason
- migration action

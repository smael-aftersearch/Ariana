# Vite Plugin Transform Contract V1

This document extends the Vite plugin version-one contract.

## Transform targets

The plugin should support:

- direct component metadata calls
- decorator component metadata usage
- multiple components in one source file
- nested object literals inside metadata
- external template resources
- external style resources

## Resource errors

Missing external resources should be reported as Ariana resource errors instead of raw file-system errors.

## Warning behavior

Warnings should not block by default.

`strictWarnings` can promote warnings into blocking Vite transform failures.

## Type-aware template checks

The plugin should build template typecheck context from component source and allow explicit symbol metadata through plugin options.

## Current coverage

Current unit coverage includes:

- multiple components in one source file
- nested metadata object literals
- missing resource error formatting
- strict warning escalation
- source-based typed property diagnostics

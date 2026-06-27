# Vite Plugin Edge Cases

This document tracks resource transform edge cases for the version-one path.

## Covered

- direct component metadata calls
- decorator component metadata usage
- multiple components in one source file
- nested metadata object literals
- missing template resource errors
- missing style resource errors
- strict warning escalation
- type-aware template diagnostics

## Still needed

- multiple component classes sharing one external template
- template resources outside the component directory
- Windows path fixtures
- style-only components
- generated render mode edge cases
- browser-backed fixture build

## Resource behavior

The plugin resolves `templateUrl` and `styleUrl` relative to the component file directory.

Missing resources should produce Ariana resource errors with the property name and resource path.

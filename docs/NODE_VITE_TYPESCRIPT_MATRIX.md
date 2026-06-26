# Node, Vite, and TypeScript Compatibility Matrix

This document records the intended compatibility targets for Ariana.

## Current release line

| Area | Target |
| --- | --- |
| Node.js | 22 |
| TypeScript | 5.8.x |
| Vite | 7.x |
| Package format | ESM |
| Module resolution | NodeNext |

## CI baseline

CI currently uses Node.js 22.

## Compatibility rules

- Do not widen compatibility claims before CI covers them.
- Do not claim support for a TypeScript version unless typecheck passes with it.
- Do not claim support for a Vite version unless a fixture app builds with it.

## Future matrix

Ariana should eventually test:

| Node | TypeScript | Vite | Status |
| --- | --- | --- | --- |
| 20 | TBD | TBD | future research |
| 22 | 5.8.x | 7.x | current baseline |
| 24 | TBD | TBD | future research |

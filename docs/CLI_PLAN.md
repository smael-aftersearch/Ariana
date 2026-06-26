# Ariana CLI Plan

Ariana needs a CLI only after the core package flow is stable.

## Package

The starter package is `create-ariana`.

## Current status

A minimal skeleton exists and can generate a basic Vite + Ariana app structure.

## First milestone

The first useful CLI milestone should support:

- app creation
- Vite starter
- TypeScript starter
- router preset
- forms preset
- query preset
- package manager detection
- generated project smoke test

## Non-goals for now

- complex generators
- schematic-style migrations
- automatic refactoring
- framework-specific IDE tooling

## Quality gate

Every generated project must pass:

```bash
npm install
npm run build
```

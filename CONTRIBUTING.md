# Contributing to Ariana

Ariana is an early TypeScript-first frontend framework. Contributions should protect the framework direction before adding surface area.

## Principles

- no Virtual DOM
- no Zone.js
- no global change detection
- no NgModule
- no standalone flag
- compiler-assisted templates
- signal-based rendering
- enterprise-first structure

## Before opening a pull request

Run:

```bash
npm install
npm run build
npm test
npm run pack:npm
npm run smoke:install
```

## Contribution priorities

Highest priority:

1. package integrity
2. install smoke tests
3. compiler diagnostics
4. public API docs
5. real examples
6. integration tests

Lower priority for now:

- large new APIs
- CLI generators
- SSR production claims
- production-ready marketing

## Pull request expectations

A good PR should include:

- tests or docs
- clear API impact
- migration note if public behavior changes
- no misleading performance claims

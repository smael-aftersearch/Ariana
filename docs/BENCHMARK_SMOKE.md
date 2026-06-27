# Benchmark Smoke

Ariana has a lightweight benchmark smoke gate for the pre-0.5.0 release line.

## Command

```bash
node scripts/bench-smoke.mjs
```

## Covered areas

- core signal and computed updates
- router repeated route matching
- forms FormArray operations
- query cache set, get, and prefix invalidation

## Purpose

This is not a full scientific benchmark suite.

It is a regression guard to catch obvious performance problems before a release candidate.

## Workflow

GitHub Actions workflow:

```txt
.github/workflows/bench-smoke.yml
```

The workflow installs dependencies, builds packages, and runs the smoke benchmark.

## 0.5.0 rule

Before 0.5.0, this benchmark smoke workflow should pass together with CI, generated app smoke, tarball inspection, and Vite fixture checks.

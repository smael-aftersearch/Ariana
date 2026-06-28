# Ariana 1.1 Release Workflow

Ariana 1.1.0 should be released from GitHub Actions instead of a local console.

Workflow file:

```text
.github/workflows/release-v1-1.yml
```

## Required secret

Add this repository secret before publishing:

```text
NPM_TOKEN
```

The token must be allowed to publish the `@ariana-framework/*` packages.

## Safe dry run

Use this first.

1. Open GitHub repository.
2. Go to **Actions**.
3. Select **Release Ariana 1.1**.
4. Click **Run workflow**.
5. Use:

```text
release_version: 1.1.0
npm_dist_tag: latest
publish_to_npm: false
create_github_release: false
deprecate_core_1_0_0: false
```

This validates build, tests, typecheck, security audit, release gates, benchmark, publish dry run, and uploads package tarballs as a workflow artifact. It does not publish anything.

## Real npm publish

Only after the dry run is green, run the workflow again with:

```text
release_version: 1.1.0
npm_dist_tag: latest
publish_to_npm: true
create_github_release: true
deprecate_core_1_0_0: true
```

This publishes the packages, optionally creates the GitHub release, and optionally deprecates `@ariana-framework/core@1.0.0` with a message directing users to 1.1.0.

## Gates included

The workflow runs:

```bash
npm run build
npm test
npm run typecheck
npm run security:audit
npm run release:gates:v1.1
npm run bench:framework
npm run publish:v1:dry
```

The real publish step runs only after all gates pass.

## Why the workflow is required

`@ariana-framework/core@1.0.0` was flagged for dynamic code execution because the published tarball contained runtime template evaluator code. Ariana 1.1.0 removes that path from core and adds tarball inspection so `eval`, `new Function`, `innerHTML`, and `document.write` patterns block release before publishing.

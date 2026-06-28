# Ariana 1.0 Security Review

This document records the security review scope and release gate for Ariana 1.0.

## Scope

Reviewed areas:

- core reactivity runtime,
- computed/effect dependency lifecycle,
- typed forms and form arrays,
- router/compiler/rendering package boundaries,
- Vite plugin packaging path,
- npm package generation and tarball inspection,
- repository-level secret and unsafe API scanning.

Out of scope:

- application-level authentication,
- authorization policies,
- backend validation,
- server-side session handling,
- payment or personally identifiable information processing.

Ariana is a frontend framework/runtime. Applications built with Ariana must still implement their own security controls for transport, authentication, authorization, validation, storage, and secret management.

## Automated gate

Run the full release-ready gate:

```bash
npm run release:ready:v1
```

This runs:

1. production build,
2. unit tests,
3. TypeScript typecheck,
4. security audit,
5. API/documentation checks,
6. runtime/compiler/template/Vite plugin gates,
7. smoke tests,
8. benchmark smoke,
9. package candidate generation,
10. tarball inspection,
11. npm publish dry run.

For security only:

```bash
npm run security:audit
```

## Security audit behavior

The `security:audit` script performs two layers of checks.

### Dependency audit

If `package-lock.json` files exist, the script runs:

```bash
npm audit --audit-level=high
```

for each lockfile directory.

If no lockfile exists, dependency audit is skipped and the static security scan still runs.

### Static repository scan

The static scan checks text files for:

- private key blocks,
- GitHub tokens,
- npm tokens,
- AWS access key IDs,
- Google API keys,
- Slack tokens,
- generic hardcoded secret assignments,
- `eval`,
- `new Function`,
- direct `innerHTML` assignment,
- `document.write`,
- direct child-process `exec` usage outside the approved command runner.

## Current release decision

Ariana 1.0 can be presented as a release candidate only after `npm run release:ready:v1` passes locally or in CI.

Any security finding must block release until it is either fixed or explicitly documented as a false positive with a narrow exception.

## Manual review notes

- No runtime feature should require storing secrets in the framework.
- Public packages should not include source-only internal scripts.
- Generated tarballs must be inspected before publish.
- Security checks are now part of the release gate and should not be bypassed for performance-only changes.

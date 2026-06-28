# Security Policy

## Supported versions

Ariana 1.x is the supported release line for security fixes after the first stable release.

| Version | Supported |
| --- | --- |
| 1.1.x | Yes |
| 1.0.x | Yes |
| < 1.0 | No |

## Reporting a vulnerability

Please report suspected vulnerabilities privately. Do not open a public issue containing exploit details, secrets, proof-of-concept payloads, or production-specific information.

A useful report should include:

- affected package or module,
- affected version or commit,
- steps to reproduce,
- expected impact,
- whether the issue affects runtime, compiler, router, forms, query, rendering, or the Vite plugin.

## Security gate

Before the Ariana 1.1 Performance & Security release, run:

```bash
npm run release:ready:v1.1
```

This includes build, unit tests, typecheck, static security audit, API/documentation gates, smoke tests, package creation, tarball inspection, and publish dry run.

For a focused security pass, run:

```bash
npm run security:audit
```

## Security boundaries

Ariana is a frontend framework/runtime and does not intentionally store credentials, manage sessions, provide authentication, or process payment data. Applications built on Ariana are responsible for their own authentication, authorization, storage, transport security, server-side validation, and secret management.

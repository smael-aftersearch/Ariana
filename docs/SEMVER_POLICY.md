# Ariana Semver Policy

Ariana is currently pre-1.0.

## Before 1.0

Breaking changes are allowed, but must be intentional and documented.

Rules:

- patch versions should contain fixes, docs, and release pipeline hardening
- minor versions may contain API changes
- breaking changes must be listed in the changelog
- migrations must be documented when user-facing APIs change

## After 1.0

Ariana should follow standard semantic versioning:

- major: breaking changes
- minor: backwards-compatible features
- patch: backwards-compatible fixes

## Public API

A public API is anything documented in `docs/API_SURFACE.md` or package README files.

Undocumented internals can change without semver guarantees before 1.0.

## Release rule

Do not publish a new version if:

- install smoke tests fail
- package integrity checks fail
- public package names are inconsistent
- generated packages contain stale imports

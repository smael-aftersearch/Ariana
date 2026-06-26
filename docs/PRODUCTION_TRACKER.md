# Ariana Production Tracker

This is the central tracker for post-publish production work.

## Release policy

Ariana should not publish a new npm version after every batch.

Release when a milestone is coherent:

- `0.4.1`: first public package line under `@ariana-framework`.
- `0.4.x`: only package integrity, CI, docs, or urgent fixes.
- `0.5.0`: next meaningful milestone; clean install, Vite fixture, core/router/forms/query integration, compiler diagnostics, and usable docs.
- `1.0.0`: only after stable public APIs, integration tests, documented semantics, and production readiness evidence.

## Completed production batches

| Range | Status | Notes |
| --- | --- | --- |
| prod-01..prod-62 | Done | Initial release hardening, npm publish workflow, official 0.4.x preparation. |
| prod-63..prod-77 | Done | Install smoke test, API docs, template docs, package README files, todo fixture. |
| prod-78..prod-89 | Done | Tarball inspection, compiler golden tests, Vite fixture, design contracts. |
| prod-90..prod-104 | Done | Effect cleanup, FormArray prototype, mutation prototype, lazy route resolver, typecheck groundwork. |
| prod-105..prod-123 | Done/partial | Bootstrap ref, FormArray async, Vite typecheck option, create-ariana skeleton, CLI smoke. |
| prod-124..prod-133 | Done/partial | Typecheck export path, generated app smoke, query invalidation tests, lazy/router/typecheck/cleanup plans. |
| prod-134..prod-154 | Done/partial | Generated app/Vite smoke hardening, query invalidation API docs, compiler typecheck docs, transform tests. |

## Current batch

| ID | Task | Status |
| --- | --- | --- |
| prod-155 | Fix CI failures reported by GitHub Actions | Pending log review |
| prod-156 | Wire Vite typecheck to real compiler context | Pending |
| prod-157 | Pass cleanup scope into generated event listeners | Pending |
| prod-158 | Promote create-ariana build after Node typings decision | Pending |
| prod-159 | Add generated app fixture coverage for router/forms/query | Pending |
| prod-160 | Prepare 0.5.0 release checklist draft | Pending |

## Next milestone target: 0.5.0

Ariana 0.5.0 should mean:

- packages install from npm in a clean project
- tarballs have no stale internal workspace imports
- Vite fixture builds
- create-ariana skeleton is validated
- generated app smoke build passes
- core lifecycle has a destroy contract
- forms include a first FormArray path
- query includes mutation/invalidation groundwork
- router includes a first lazy route path
- compiler diagnostics and typecheck groundwork are documented

## Do not do yet

- do not claim production-ready status
- do not publish every small batch
- do not rename the npm scope again
- do not add large user-facing APIs without tests or docs
- do not claim SSR/SSG production support before integration tests

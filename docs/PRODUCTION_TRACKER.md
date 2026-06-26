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

## Current batch

| ID | Task | Status |
| --- | --- | --- |
| prod-124 | Fix CI failures from batch 5 | In progress |
| prod-125 | Compiler typecheck public export safe path | Done |
| prod-126 | create-ariana build config safe path | Partial |
| prod-127 | Generated app smoke validation | In progress |
| prod-128 | Query invalidation helper tests | Done |
| prod-129 | Mutation invalidation/after-success tests | Done |
| prod-130 | Lazy router guards/preload design | Pending |
| prod-131 | Vite typecheck real context | Pending |
| prod-132 | Component cleanup/render scope design | Pending |
| prod-133 | Docs/API surface sync | In progress |

## Next milestone target: 0.5.0

Ariana 0.5.0 should mean:

- packages install from npm in a clean project
- tarballs have no stale internal workspace imports
- Vite fixture builds
- create-ariana skeleton is validated
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

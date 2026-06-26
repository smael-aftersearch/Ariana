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

## Current batch

| ID | Task | Status |
| --- | --- | --- |
| prod-134 | Fix generated app smoke CI failures | In progress |
| prod-135 | Fix Vite fixture component transform | In progress |
| prod-136 | Finalize compiler typecheck subpath docs | Done |
| prod-137 | Promote create-ariana build safely | Deferred until Node types/build config are stable |
| prod-138 | Add QueryClient direct prefix invalidation API | Done |
| prod-139 | Component cleanup scope event listener plan | Done |
| prod-140 | Generated app smoke script | Done |
| prod-141 | CI generated app smoke step | Done |
| prod-142 | QueryClient invalidateMatching tests | Done |
| prod-143 | Supplemental docs index | Done |
| prod-144 | Production tracker maintenance | Done |

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

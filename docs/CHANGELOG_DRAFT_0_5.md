# Ariana 0.5.0 Changelog Draft

This is a draft changelog for the next milestone.

## Added

- install smoke test from generated tarballs
- generated app smoke test with Vite build
- tarball inspection for package metadata and published files
- Vite resource transform tests
- Vite typecheck options groundwork
- compiler typecheck subpath
- destroyable bootstrap reference
- cleanup scope primitive
- effect cleanup callback support
- FormArray prototype
- FormArray async validation aggregation
- query mutation groundwork
- query prefix invalidation API
- lazy router resolution groundwork
- create-ariana starter skeleton
- 0.5 checklist

## Changed

- CI validates more than build and unit tests.
- Generated app smoke covers core, router, forms, query, and Vite plugin together.
- Vite plugin supports decorator syntax and direct Component call syntax.
- create-ariana is included in the root build path with minimal Node shims.

## Still not production-ready

Remaining areas:

- full template type checking
- cleanup scope in all generated event listeners
- browser interaction coverage
- SSR and SSG production validation
- stable 1.0 API policy

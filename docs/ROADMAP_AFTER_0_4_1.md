# Ariana Roadmap After 0.4.1

Ariana 0.4.1 is the first public npm release line under the official `@ariana-framework` scope.

This document defines what must happen next to turn Ariana from an early published framework into a serious, usable frontend framework.

## Current status

Ariana currently has:

- published package line under `@ariana-framework/*`
- core signal runtime
- basic component metadata
- dependency injection primitives
- template runtime helpers
- compiler diagnostics and AST parser
- Vite resource transform plugin
- typed router package
- forms package
- query/cache package
- rendering and island helpers
- unit tests
- release workflow
- npm staging and publishing workflow

Ariana is not yet a complete production framework.

## Non-negotiable direction

Ariana must keep these principles:

- no Virtual DOM
- no Zone.js
- no global change detection
- no NgModule
- no standalone flag
- class-based component model
- external HTML and CSS by default
- compiler-assisted templates
- signal-based rendering
- production behavior must be measured, not claimed

## Phase 1: Stabilize the public release line

Goal: make the published packages installable, coherent, and safe to use in a small test app.

Tasks:

- Verify every published package exists on npm.
- Verify `npm install @ariana-framework/core` works in a clean project.
- Verify optional packages install together without dependency conflicts.
- Verify all package tarballs contain correct package names, versions, dependencies, and import paths.
- Remove transitional internal `@ariana/*` package naming from source workspace when safe.
- Align root version and package versions with the published npm line.
- Add a real package install smoke test to CI.
- Add a generated fixture app that installs from packed tarballs and builds.
- Add package-level README files for all public packages.
- Add API surface documentation for every package.

Do not:

- publish another version before clean install testing passes.
- claim production-ready status.
- rename the npm scope again.
- add big features before package integrity is stable.

## Phase 2: Core runtime stabilization

Goal: make `@ariana-framework/core` a stable foundation.

Tasks:

- Finalize signal API.
- Finalize computed/effect lifecycle behavior.
- Add component lifecycle hooks.
- Add destroy/cleanup semantics for components and effects.
- Add error boundaries or component error handling strategy.
- Add scheduler policy for batched updates.
- Add DOM update strategy for text, props, attrs, class, style, and events.
- Add public API tests and compatibility tests.
- Add runtime memory leak tests for repeated mount/unmount.

Do not:

- add framework magic that hides data flow.
- introduce global dirty checking.
- introduce Zone.js-like behavior.
- allow component-wide rerender as the default update model.

## Phase 3: Compiler and template pipeline

Goal: move Ariana from runtime-friendly templates to a real compiler-assisted framework.

Tasks:

- Complete template AST coverage.
- Define official template grammar.
- Add strict template diagnostics.
- Compile interpolation into direct text update instructions.
- Compile property, attribute, class, style, and event bindings.
- Compile `@if` and `@for` into stable DOM instructions.
- Add source-map-friendly diagnostics.
- Add template type checking against component class shape.
- Add compiler snapshot tests and golden output tests.
- Add compiler benchmark gates.

Do not:

- interpret templates at runtime in production.
- depend on Virtual DOM diffing.
- silently ignore invalid templates.

## Phase 4: Vite plugin productionization

Goal: make the Vite plugin the official bridge from component files to compiled output.

Tasks:

- Support `templateUrl` and `styleUrl` robustly.
- Support inline template/style only as a secondary path.
- Resolve assets safely.
- Add watch-mode invalidation tests.
- Add dev/prod mode differences.
- Add plugin integration tests with a real Vite app.
- Add clear diagnostics in terminal and editor output.
- Ensure generated imports use `@ariana-framework/*`.

Do not:

- generate unstable code shapes without tests.
- hide compiler errors behind fallback runtime behavior in strict mode.

## Phase 5: Router maturity

Goal: make router usable for real admin/dashboard apps.

Tasks:

- Add nested layouts.
- Add lazy route loading.
- Add route-level providers.
- Add navigation lifecycle events.
- Add before/after guards.
- Add redirect handling and loop protection.
- Add query string and hash utilities.
- Add typed route params.
- Add route data loading strategy.
- Add router integration example.

Do not:

- copy Angular router complexity blindly.
- make lazy loading create uncontrolled chunk explosion without documentation and controls.

## Phase 6: Forms maturity

Goal: make forms useful for enterprise CRUD and admin screens.

Tasks:

- Finalize FormControl and FormGroup APIs.
- Add FormArray.
- Add nested forms.
- Add sync and async validators.
- Add cross-field validators.
- Add touched/dirty/pending semantics tests.
- Add form binding helpers.
- Add error display helpers.
- Add real examples for login, profile, and dynamic forms.

Do not:

- make forms depend on global change detection.
- force users into template-only form definitions.

## Phase 7: Query/cache maturity

Goal: make query/cache package useful for dashboard apps.

Tasks:

- Finalize QueryClient API.
- Add stale time and cache time semantics.
- Add retries and cancellation.
- Add mutation API.
- Add optimistic updates.
- Add invalidation by key prefix or tags.
- Add devtools-friendly state inspection.
- Add examples with REST APIs.

Do not:

- overbuild before real examples prove the API.

## Phase 8: Rendering, SSR, SSG, islands

Goal: make rendering package practical, not just experimental.

Tasks:

- Define SSR rendering contract.
- Define SSG route generation contract.
- Define hydration/island lifecycle.
- Add streaming SSR research.
- Add partial hydration tests.
- Add cleanup and memory tests.
- Add static site example.
- Add SSR example.

Do not:

- claim SSR production support before real integration tests exist.

## Phase 9: Developer experience

Goal: make Ariana easy to try and hard to misuse.

Tasks:

- Add `create-ariana` project starter.
- Add CLI for new app, component, route, service, and package checks.
- Add documentation website.
- Add examples gallery.
- Add migration guide for Angular/React users.
- Add error code catalog.
- Add API reference generation.
- Add VS Code extension research.

Do not:

- prioritize CLI before core APIs are stable enough.

## Phase 10: Quality gates and release discipline

Goal: make every release measurable and safe.

Tasks:

- Add install smoke test from npm tarballs.
- Add browser integration tests.
- Add benchmark trend tracking.
- Add compatibility matrix for Node/Vite/TypeScript.
- Add changeset or release automation.
- Add semver policy.
- Add deprecation policy.
- Add security policy for vulnerabilities.
- Add issue templates and contribution guide.

Do not:

- publish from a dirty or unverified package state.
- release breaking changes without a versioning decision.

## Immediate next steps

These are the next concrete tasks after 0.4.1:

1. Verify real npm publish under `@ariana-framework/*`.
2. Create a clean external app and install all packages from npm.
3. Add install smoke test to CI.
4. Remove or isolate transitional `@ariana/*` internal names.
5. Add package README files for all packages.
6. Add `docs/API_SURFACE.md`.
7. Add `docs/TEMPLATE_SYNTAX.md`.
8. Add `docs/COMPILER_ROADMAP.md`.
9. Add `examples/todo-app` as the first realistic demo.
10. Start compiler output hardening.

## Definition of a good next milestone

The next milestone should be `0.5.0`.

Ariana 0.5.0 should mean:

- install works from npm in a clean project
- a real example app builds with Vite
- core/router/forms/query packages work together
- compiler diagnostics are stable
- Vite plugin strict mode is reliable
- package docs are usable
- no misleading production-ready claim exists

## Definition of production-ready later

Ariana should only be called production-ready after:

- stable semver policy
- stable compiler output
- documented public APIs
- integration tests
- real browser tests
- SSR/SSG status clarified
- performance claims backed by repeatable benchmarks
- at least one real non-trivial app example

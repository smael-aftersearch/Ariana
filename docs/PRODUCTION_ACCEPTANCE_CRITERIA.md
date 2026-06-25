# Ariana Production Acceptance Criteria

This file defines the concrete criteria required before Ariana can be marked production-ready.

## Release gates

A release can be promoted beyond alpha only when:

- `npm run build` passes.
- `npm run typecheck` passes.
- `npm run verify:release` passes.
- all package tarballs are generated.
- install smoke tests pass from tarballs.
- browser benchmark workflow passes.
- unit test workflow passes.
- integration test workflow passes.
- documentation build passes.

## Performance gates

Initial production gates:

| Area | Gate |
|---|---:|
| Signal update | under 5 us/update in Node micro benchmark |
| List targeted update | under 150 us/op for 300 rows in jsdom |
| Router match | under 10 us/match for 250 routes |
| Query set/get | under 2 us/op for 1,000 keys |
| Static page generation | under 25 us/page for 1,000 pages |
| Browser counter update | measured in Chrome CI |
| Browser list update | measured in Chrome CI |
| Initial bundle size | measured in CI and tracked per release |

## API stability gates

- public exports are listed per package.
- every public API has a short doc entry.
- breaking changes require changelog entries.
- deprecated APIs remain for at least one minor release after deprecation.

## Compiler gates

- template parser emits AST nodes with source locations.
- compiler diagnostics include readable messages.
- Vite plugin consumes the compiler package instead of owning parser/codegen logic.
- snapshot tests exist for compiled output.
- runtime fallback remains available for unsupported templates.

## Router gates

- nested routes work.
- route params work.
- route guards work.
- async guards work.
- redirects work.
- route-level providers work.
- current route is observable through signals.

## Forms gates

- formControl works.
- formGroup works.
- sync validators work.
- async validators work.
- incremental group validation works.
- touched/dirty states work.
- template integration exists.

## Query gates

- query state includes data, error, status, and updatedAt.
- stale time is supported.
- request deduplication is supported.
- cancellation is supported.
- retry is supported.
- invalidation is supported.

## Rendering gates

- static page generation works.
- route-based SSG works.
- server rendering path exists.
- islands can be defined.
- island activation runtime exists.
- hydration strategy is documented.

## Documentation gates

- getting started guide
- package overview
- API reference
- router guide
- forms guide
- query guide
- rendering guide
- production limitations
- migration notes

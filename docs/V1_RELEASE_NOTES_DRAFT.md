# Ariana 1.0 Release Notes Draft

## Summary

Ariana 1.0 is the first stable API milestone for the framework.

## Highlights

- Stable public API registry.
- Compiler diagnostics with line and column locations.
- Template typecheck groundwork.
- Compiler diagnostic formatter APIs.
- Template diagnostics CLI.
- Runtime lifecycle cleanup contract.
- Vite plugin v1 transform contract.
- Vite plugin type-aware diagnostics and formatted errors.
- 1.0 candidate packaging helper.

## Packages

- `@ariana-framework/core`
- `@ariana-framework/compiler`
- `@ariana-framework/router`
- `@ariana-framework/forms`
- `@ariana-framework/query`
- `@ariana-framework/rendering`
- `@ariana-framework/vite-plugin`

## Known limitations

- Full TypeScript compiler API backed template semantic analysis is not complete.
- Browser-backed lifecycle and Vite fixture coverage still needs final validation.
- Generated render source maps are documented as a limitation unless proven blocking before release.
- Performance claims require captured benchmark output.

## Publish note

This draft does not publish anything. It prepares the release communication for review.

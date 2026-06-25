# Production Batch 14 to 16

Completed together:

- compiler AST parser upgrade
- compiler diagnostics upgrade
- AST-aware tests
- Vite plugin diagnostic gate
- production compiler benchmark

## Compiler

Added a richer AST parser with:

- source spans
- element nodes
- attribute nodes
- static, property, class, and event bindings
- interpolation nodes
- if blocks
- for blocks
- coded diagnostics

## Vite plugin

The Vite plugin now uses `@ariana/compiler` diagnostics before running local code generation. In strict mode, template errors fail transformation.

## Tests

Added tests for:

- AST element parsing
- AST binding parsing
- interpolation parsing
- if block parsing
- for block parsing
- invalid template diagnostics
- Vite plugin diagnostic behavior

## Benchmark

Added a production compiler benchmark with a realistic template and a parser performance gate.

## Note

The direct `@ariana/compiler` dependency update in `packages/vite-plugin/package.json` was blocked by the connector. The source import and TypeScript path mapping are in place; package metadata should be synced manually if the connector continues to block package.json updates.

## Next

`prod-17-package-metadata-sync`

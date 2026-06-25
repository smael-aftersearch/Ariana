# @ariana/compiler

Template parsing and diagnostics for Ariana.

## Features

- Parses Ariana templates into AST nodes.
- Supports elements, attributes, interpolation, `@if`, and `@for` blocks.
- Emits coded diagnostics for invalid templates.
- Provides source spans for compiler tooling.

## Usage

```ts
import { parseTemplateToAst } from '@ariana/compiler';

const result = parseTemplateToAst('<h1>{{ title }}</h1>');

if (result.diagnostics.length > 0) {
  console.log(result.diagnostics);
}

console.log(result.ast);
```

## Status

This package is production-track alpha. The AST parser is now the diagnostic source used by the Ariana Vite plugin. Full AST-driven code generation is the next compiler milestone.

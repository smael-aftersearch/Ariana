# @ariana-framework/compiler

Template parsing and diagnostics for Ariana.

## Features

- Parses Ariana templates into AST nodes.
- Supports elements, attributes, interpolation, `@if`, and `@for` blocks.
- Emits coded diagnostics for invalid templates.
- Provides source spans for compiler tooling.

## Install

```bash
npm install @ariana-framework/compiler
```

## Usage

```ts
import { parseTemplateToAst } from '@ariana-framework/compiler';

const result = parseTemplateToAst('<h1>{{ title }}</h1>');

if (result.diagnostics.length > 0) {
  console.log(result.diagnostics);
}

console.log(result.ast);
```

## Status

Official early release. The AST parser is the diagnostic source used by the Ariana Vite plugin. Full AST-driven code generation is the next compiler milestone.

# @ariana-framework/core

Core runtime package for Ariana.

## Includes

- signals
- computed values
- effects
- list signals
- component metadata
- dependency injection primitives
- bootstrap helpers

## Install

```bash
npm install @ariana-framework/core
```

## Example

```ts
import { computed, signal } from '@ariana-framework/core';

const count = signal(1);
const double = computed(() => count() * 2);
```

## Status

Official early release. API is still pre-1.0.

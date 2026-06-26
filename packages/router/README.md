# @ariana-framework/router

Typed router package for Ariana applications.

## Includes

- route matching
- params
- guards
- redirects
- route data
- route providers
- nested routes

## Install

```bash
npm install @ariana-framework/router @ariana-framework/core
```

## Example

```ts
import { createRouter } from '@ariana-framework/router';

class HomePage {}

const router = createRouter([
  { path: '/', component: HomePage }
]);
```

## Status

Official early release. Lazy routes and nested layouts are planned later.

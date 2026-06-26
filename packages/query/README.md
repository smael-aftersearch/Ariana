# @ariana-framework/query

Query and cache package for Ariana applications.

## Includes

- QueryClient
- query state signals
- stale-time handling
- retry support
- cancellation signal forwarding

## Install

```bash
npm install @ariana-framework/query @ariana-framework/core
```

## Example

```ts
import { createQueryClient } from '@ariana-framework/query';

const query = createQueryClient();
await query.fetch('user:1', async () => ({ id: 1 }));
```

## Status

Official early release. Mutation APIs and advanced invalidation are planned later.

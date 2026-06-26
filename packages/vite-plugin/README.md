# @ariana-framework/vite-plugin

Vite integration package for Ariana.

## Includes

- component resource transform
- `templateUrl` loading
- `styleUrl` loading
- compiler diagnostics integration
- strict template mode

## Install

```bash
npm install -D @ariana-framework/vite-plugin
```

## Example

```ts
import { ariana } from '@ariana-framework/vite-plugin';

export default {
  plugins: [ariana()]
};
```

## Status

Official early release. The generated output shape is still being hardened.

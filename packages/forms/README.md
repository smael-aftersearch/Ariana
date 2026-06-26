# @ariana-framework/forms

Signal-based forms package for Ariana.

## Includes

- form controls
- form groups
- sync validators
- async validators
- dirty/touched/pending state

## Install

```bash
npm install @ariana-framework/forms @ariana-framework/core
```

## Example

```ts
import { formControl, required } from '@ariana-framework/forms';

const name = formControl('', [required()]);
```

## Status

Official early release. FormArray and nested form APIs are planned for a later milestone.

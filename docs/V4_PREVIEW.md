# Ariana v4 Rendering Preview

Ariana v4 starts the rendering and delivery layer.

## What v4 adds in this preview

- `@ariana/rendering`
- `renderToString()` shell rendering
- `generateStaticPages()` SSG helper
- `defineIsland()` island manifest helper
- island placeholder rendering
- island manifest script generation

## Example

```ts
import { defineIsland, generateStaticPages, islandScript, renderIslandPlaceholder, renderToString } from '@ariana/rendering';

const pages = generateStaticPages(['/admin', '/reports'], path => {
  const island = defineIsland(`counter-${path}`, 'CounterIsland', { path });
  return renderToString(`<main>${renderIslandPlaceholder(island)}</main>${islandScript([island])}`);
});
```

## v4 scope

The v4 goal is not to replace the v3 enterprise layer. It adds deployment and rendering modes:

- SSR
- SSG
- island-style partial interactivity
- hydration/resume experiments
- chunk analyzer
- browser benchmark automation

## Current status

```txt
v3 enterprise layer:
  preview-complete enough for v4 work

v4 rendering:
  first rendering package available

next:
  browser benchmark automation, hydration strategy, route-based SSG
```

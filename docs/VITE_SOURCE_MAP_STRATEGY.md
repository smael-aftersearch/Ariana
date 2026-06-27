# Vite Source Map Strategy

Ariana's Vite plugin currently performs metadata resource transforms and optional template compilation.

## Version one strategy

The version-one strategy is conservative:

- resource metadata transforms should keep the surrounding source readable
- template fallback mode should preserve component class source shape
- compiled render mode may generate code that needs explicit source-map support later
- diagnostics should point to template files through compiler diagnostic locations

## Current diagnostic mapping

Template diagnostics are mapped to the template source, not the transformed TypeScript source.

This is intentional because template errors should report positions inside the external HTML template.

## Source map requirement before 1.0

Before version one, Ariana should decide whether generated render functions need source-map output from the compiler package or whether template diagnostics are enough for the initial stable release.

## Current recommendation

For 1.0, keep generated render source maps as a documented limitation unless browser/editor fixtures show it is blocking real app debugging.

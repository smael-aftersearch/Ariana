# Template Diagnostics CLI

Ariana has a diagnostic CLI groundwork for the version one compiler path.

## Command

```bash
node scripts/template-diagnostics.mjs <template.html> [component.ts]
```

## Behavior

The command:

- reads the template file
- optionally reads a component source file
- infers a typecheck context from the component source
- runs `typeCheckTemplate`
- formats diagnostics with `formatTemplateDiagnostics`
- exits with code `1` when errors exist

## Fixture gate

The repository includes a fixture check:

```bash
npm run check:template-diagnostics-fixture
```

The fixture intentionally contains:

- an unknown typed object property
- a method argument count error

This ensures formatted diagnostics stay stable for CLI and future editor integrations.

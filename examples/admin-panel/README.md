# Ariana Admin Panel Example

This is the full Ariana 1.1 admin-panel showcase. It is inspired by the previous ITSurge Admin Pro static dashboard, but implemented as an Ariana example that exercises framework features instead of only rendering static HTML/CSS.

## What this example demonstrates

- Ariana bootstrap with providers
- dependency injection with `inject()`
- auth/login service
- English/Persian language switching
- RTL/LTR direction switching
- routed admin sections
- lazy route module imports
- visible route loading state
- QueryClient data loading and cache status
- signal state for shell, theme, modals and filters
- computed values for active title, filtered users and report completion
- topbar tools, notification menu, profile menu and command palette
- dashboard, analytics, users, roles, products, orders, reports, calendar and settings sections

## Run

```bash
npm run demo:admin
```

## Build

```bash
npm run build:admin
```

## Demo credentials

```txt
admin@ariana.dev
demo1234
```

## Notes

This example is intended to prove Ariana runtime capabilities. It should remain more than a decorative template: every release should keep routing, lazy loading, DI, query loading, login and i18n working.

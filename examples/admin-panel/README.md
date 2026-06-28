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
- SCSS compiled by Vite in the admin workspace
- `animate.enter` and `animate.leave` samples for panels, toasts, rows and removal flow

## Run

```bash
npm run demo:admin
```

## Animation and SCSS lab

Run the admin app and open:

```txt
http://localhost:5173/?lab=animation
```

This lab intentionally uses:

```ts
@Component({
  selector: 'ari-admin-animation-lab-page',
  templateUrl: './animation-lab.page.html',
  styleUrl: './animation-lab.page.scss'
})
export class AdminAnimationLabPage {}
```

The template includes:

```html
<section animate.enter="ari-slide-up ari-scale-in" animate.leave="ari-slide-down ari-scale-out">
  ...
</section>
```

Use the buttons to test:

- enter animation
- leave animation
- signal-driven row insertion
- signal-driven row removal
- SCSS nested selectors and media queries

## Build

```bash
npm run build:admin
```

## Demo credentials

```txt
admin@ariana.dev
demo1234
```

## Release gate

The release gate checks that the admin animation lab keeps using SCSS and animation attributes:

```bash
node scripts/check-admin-animation-lab.mjs
```

## Notes

This example is intended to prove Ariana runtime capabilities. It should remain more than a decorative template: every release should keep routing, lazy loading, DI, query loading, login, i18n, SCSS and animation samples working.

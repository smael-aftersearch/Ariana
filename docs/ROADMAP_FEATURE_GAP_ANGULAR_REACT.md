# Ariana Feature Gap Roadmap

This roadmap tracks capabilities commonly used in Angular, React and modern enterprise frontend applications that Ariana should support without compromising performance or security.

## Principles

Ariana features must follow these rules:

1. Keep runtime small and predictable.
2. Prefer compile-time transforms over runtime interpretation.
3. Avoid dynamic code execution in published packages.
4. Add tests and release gates for every runtime feature.
5. Measure performance impact before promoting a feature to stable.
6. Keep APIs explicit and TypeScript-first.

## Ariana 1.2: Styling and Animation Release

### P0: SCSS/Sass `styleUrl` support

Goal:

```ts
@Component({
  selector: 'ari-user-page',
  templateUrl: './user.page.html',
  styleUrl: './user.page.scss'
})
export class UserPage {}
```

Implementation strategy:

- Keep `.css` behavior backward compatible.
- For `.scss` and `.sass`, let Vite preprocess the stylesheet through an inline import.
- Require the app/example to install `sass` when using Sass files.
- Do not add Sass compiler work to Ariana runtime.

Performance rule:

- Sass compilation is build-time only.
- Runtime style behavior remains a static string on component metadata.

Security rule:

- No runtime Sass compilation.
- No dynamic evaluation.
- No reading files from user-controlled paths at runtime.

### P0: Class-based animation API

Goal:

```html
@if (open()) {
  <section animate.enter="fade-in" animate.leave="fade-out">
    Content
  </section>
}
```

Implementation strategy:

- Compile `animate.enter` to `data-ari-animate-enter`.
- Compile `animate.leave` to `data-ari-animate-leave`.
- Add a tiny generated helper that applies classes and waits for `animationend` or `transitionend`.
- Avoid a large animation runtime package in 1.2.

Performance rule:

- No polling.
- No global observer.
- Only nodes inside the mounted fragment are inspected.
- Leave animation cleanup must fall back quickly when no animation event fires.

Security rule:

- Animation values are treated as class names only.
- No JavaScript expressions inside animation class values in the first version.

### P1: Style encapsulation

Proposed API:

```ts
@Component({
  selector: 'ari-card',
  templateUrl: './card.html',
  styleUrl: './card.scss',
  encapsulation: 'scoped'
})
export class CardComponent {}
```

Options:

- `none`
- `scoped`
- `shadow`

### P1: Route transitions

Proposed API:

```ts
const routes = [
  { path: '/users', loadComponent: () => import('./users.page.js'), transition: 'slide' }
];
```

## Ariana 1.3: Routing and Async UX Release

- Router outlet component
- Nested layouts
- Route loader/resolver
- Suspense/loading/error boundary
- Route preloading strategies
- Guard-friendly auth samples

## Ariana 1.4: Enterprise Runtime Release

- HTTP client
- Interceptors
- First-class auth guards
- i18n extraction
- Testing utilities
- Accessibility primitives
- Devtools/debug panel

## Ariana 1.5: SSR and Hydration Release

- SSR pipeline
- Route metadata/head management
- Partial hydration
- Island hydration triggers
- Static page generation

## Required release gates

Every roadmap item must add at least one of the following:

- unit test
- smoke test
- documentation gate
- benchmark smoke
- package tarball inspection

The feature is not stable unless it passes:

```bash
npm run build
npm test
npm run typecheck
npm run security:audit
npm run release:gates:v1.1
```

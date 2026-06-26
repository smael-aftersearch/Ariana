# Generated App Browser Interaction Plan

The generated app smoke test currently validates that a temporary Vite app builds with Ariana packages installed from tarballs.

## Current coverage

The generated app imports and uses:

- `@ariana-framework/core`
- `@ariana-framework/router`
- `@ariana-framework/forms`
- `@ariana-framework/query`
- `@ariana-framework/vite-plugin`

## Next coverage target

The next step is browser interaction coverage.

Target checks:

- button click updates a signal
- router match runs in generated app
- form value can be read
- query cache can be written and read
- Vite plugin participates in the build

## Possible implementation paths

1. Use a lightweight browser runner later.
2. Use Playwright only after dependency policy is decided.
3. Keep CI dependency-free for now and validate through Vite build plus source-level checks.

## 0.5.0 position

For 0.5.0, generated app build coverage is required. Browser interaction coverage is desirable but can remain a follow-up unless CI dependencies are approved.

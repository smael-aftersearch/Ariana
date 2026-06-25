# Ariana v3 Completion Notes

Ariana v3 focused on the enterprise application layer on top of the v2 compiler/runtime work.

## v3 completed capabilities

- `@ariana/router` typed router preview
- route parameter matching
- sync and async route guards
- redirect guards
- route metadata inheritance
- route-level provider collection
- `@ariana/forms` typed signal forms preview
- `formControl()`
- `formGroup()`
- validators such as `required()` and `minLength()`
- `@ariana/query` query/cache preview
- query status signals
- query data/error signals
- cache set/get/fetch/invalidate/clear
- compiler AST package boundary in `@ariana/compiler`
- benchmarks for router, forms, query, compiler AST, and list operations

## Remaining v3 limitations

- forms are still a preview and do not include async validators yet
- query package does not yet include retries, cancellation, stale time, or request deduping
- router does not yet mount components automatically into nested outlets
- compiler AST package exists but codegen still lives in the Vite plugin preview

## v3 conclusion

v3 is complete enough as an enterprise-preview layer. Ariana can now move into v4 rendering work: SSR, SSG, islands, hydration experiments, and browser benchmark automation.

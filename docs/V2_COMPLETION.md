# Ariana v2 Completion Notes

Ariana v2 was focused on proving that Ariana can move from a runtime template parser to compiler-generated render functions.

## v2 completed capabilities

- compiled render function metadata
- Vite template compilation path
- interpolation compilation
- event binding compilation
- property binding compilation
- class binding compilation
- simple `@if` compilation
- keyed `@for` compilation
- fast row binding
- `listSignal()` targeted list primitive
- compiled `@for` integration with `listSignal`
- targeted update, insert, remove, move, and clear handling
- normal signal fallback for compatibility
- micro, list, scheduler, operation, router, and AST benchmarks

## Remaining v2 limitations

- compiler is still string/regex-based in the Vite plugin
- AST package exists but is not fully integrated into codegen yet
- browser benchmark automation is not complete yet
- child component compilation is still limited
- `@else` / `@else if` are still not implemented

## v2 conclusion

v2 is complete enough as a compiler/runtime preview. The next work should happen under the v3 enterprise preview scope.

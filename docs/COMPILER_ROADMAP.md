# Ariana Compiler Roadmap

The Ariana compiler is the path from class-based components and external templates to direct DOM instructions.

## Goals

- compile templates ahead of runtime
- avoid Virtual DOM
- avoid global change detection
- produce actionable diagnostics
- support strict template checking
- generate predictable, testable output

## Stage 1: Parser and AST

Status: started.

Tasks:

- cover elements
- cover text nodes
- cover interpolation
- cover bindings
- cover events
- cover `@if`
- cover `@for`
- track source spans
- normalize diagnostic codes

## Stage 2: Diagnostics

Tasks:

- missing close tag
- invalid interpolation
- invalid binding syntax
- invalid event syntax
- invalid `@if` block
- invalid `@for` expression
- missing `track` expression for production lists
- unknown binding category
- source location output

## Stage 3: Code generation

Tasks:

- generate create phase
- generate update phase
- generate cleanup phase
- generate signal subscriptions
- generate text updates
- generate prop/attr/class/style updates
- generate event listener cleanup
- generate keyed list operations
- generate conditional anchor operations

## Stage 4: Template type checking

Tasks:

- validate component field access
- validate method calls
- validate event handler existence
- validate loop variable scope
- validate block scope
- validate binding target type where possible

## Stage 5: Integration

Tasks:

- integrate compiler into Vite plugin
- surface diagnostics in dev server
- fail production build in strict mode
- add integration tests with real Vite app
- add golden tests for generated code

## Non-goals

- no runtime template parser in production
- no Virtual DOM diff output
- no silent fallback in strict production mode

## Exit criteria for 0.5.0

- compiler diagnostics are stable enough to document
- generated output has golden tests
- Vite plugin strict mode is reliable
- interpolation, bindings, events, `@if`, and `@for` are covered by tests

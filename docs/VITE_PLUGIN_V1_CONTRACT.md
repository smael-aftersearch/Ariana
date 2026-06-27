# Vite Plugin V1 Contract

This document defines the version-one target for the Ariana Vite plugin.

## Goals

The Vite plugin should provide a production-ready bridge between class-based Ariana components and external HTML/CSS resources.

## Supported component resources

- `templateUrl`
- `styleUrl`

## Template modes

The plugin supports:

- runtime template fallback when compilation is disabled
- compiler-generated render functions when compilation is enabled and no blocking diagnostic exists

## Diagnostic behavior

The plugin must use compiler-owned diagnostics and formatting.

- parser errors block strict template builds
- typecheck errors block strict typecheck builds
- warnings do not block by default
- warnings can block when `strictWarnings` is enabled

## Typecheck behavior

The plugin builds template typecheck context from component source through compiler-owned helpers.

The plugin supports:

- inferred component members
- source-based typed field symbols
- explicit typecheck members
- explicit typecheck symbols

## Options

- `include`
- `compileTemplates`
- `strictTemplates`
- `strictWarnings`
- `typeCheckTemplates`
- `templateTypeCheckMembers`
- `templateTypeCheckSymbols`

## Version one requirements

Before version one, this contract needs:

- robust multi-component source coverage
- source map strategy documentation
- browser fixture coverage
- package install smoke coverage
- migration notes for option renames or behavior changes

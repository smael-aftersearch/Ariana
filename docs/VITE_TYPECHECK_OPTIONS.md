# Vite Template Typecheck Options

Ariana Vite plugin has early template typecheck groundwork.

## Options

```ts
ariana({
  strictTemplates: true,
  typeCheckTemplates: true,
  templateTypeCheckMembers: ['title', 'save']
})
```

## Explicit members

`templateTypeCheckMembers` provides a safe explicit context for template type checking.

If the template uses a member that is not listed, the plugin throws:

```txt
ARI_TYPE_UNKNOWN_MEMBER
```

## Inferred members

The plugin also has a simple class-source inference pass for fields and methods:

```ts
class Page {
  title = 'Ariana';
  save() {}
}
```

This can satisfy template expressions such as:

```html
<p>{{ title }}</p>
<button (click)="save()">Save</button>
```

## Current limitations

This is not full TypeScript semantic analysis.

It does not yet support:

- inherited members
- generic types
- private/public enforcement
- complex expression types
- external class declarations

## 0.5.0 rule

The option can be documented as early groundwork, but not as complete template type checking.

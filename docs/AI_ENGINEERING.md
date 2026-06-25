# AI Engineering Notes

Ariana is currently a fully AI-assisted framework prototype.

This document explains how the repository is being generated, what was reviewed, and what technical direction was selected.

---

## AI identity

```txt
AI assistant: ChatGPT
Model identity: GPT-5.5 Thinking
Role: AI software engineering assistant
Work: architecture, documentation, v1 prototype implementation, roadmap planning, benchmark planning
```

The AI assistant is not presented as a human maintainer. It is the AI engineering assistant currently producing the first version of the framework under human direction.

---

## Human direction

The human direction for Ariana established these constraints:

- Keep the framework organized and enterprise-friendly.
- Prefer class-based components.
- Keep HTML and CSS external by default.
- Do not copy Angular's module complexity.
- Do not include `standalone: true` because Ariana has no module system.
- Make performance a first-class goal.
- Compare against React only after Ariana has a real compiler.

---

## Reviewed ideas

The AI assistant reviewed ideas from:

- Angular: class components, DI, enterprise structure, forms, routing.
- React: ecosystem, component composition, rerender and Virtual DOM trade-offs.
- Vue: template readability and ergonomics.
- Svelte: compiler-oriented rendering and direct DOM output.
- Solid: fine-grained signal reactivity.
- Qwik: resumability, deferred to a later phase.
- Astro: islands, deferred to a later phase.
- Blazor/Razor: route closeness and explicit page structure.

---

## Main conclusion

Ariana should not try to copy every framework at once.

The selected direction is:

```txt
Angular-like class structure
+ Solid-like signal reactivity
+ Svelte-like compiler direction
+ external HTML/CSS by default
- NgModule
- standalone flag
- Zone.js
- Virtual DOM
- global change detection
```

---

## Why `standalone: true` does not exist

`standalone: true` exists in Angular because Angular historically had `NgModule`.

Ariana starts without modules. Therefore every Ariana component is independent by default.

Correct Ariana style:

```ts
@Component({
  selector: 'ari-page',
  templateUrl: './page.html',
  styleUrl: './page.css'
})
export class Page {}
```

---

## Current state

Ariana v1 alpha currently contains:

- core reactivity
- class component metadata
- route metadata
- bootstrap
- basic DI
- runtime template renderer
- Vite resource transform for `templateUrl` and `styleUrl`
- counter demo
- technical docs
- roadmap
- benchmark plan

The next major work item is v2 compiler design.

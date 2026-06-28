# Ariana 1.2 Animation API

Ariana 1.2 introduces a small class-based animation API for compiled templates.

## Goals

- Support common enter and leave animations.
- Keep the runtime small.
- Avoid global observers and polling.
- Treat animation values as CSS class names only.
- Preserve predictable cleanup behavior.

## Template API

```html
@if (open()) {
  <section animate.enter="fade-in" animate.leave="fade-out">
    Content
  </section>
}
```

Multiple classes are allowed:

```html
<div animate.enter="fade-in scale-in" animate.leave="fade-out scale-out"></div>
```

## CSS example

```css
.fade-in {
  animation: fade-in 160ms ease-out both;
}

.fade-out {
  animation: fade-out 140ms ease-in both;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fade-out {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(6px); }
}
```

## Performance model

The compiler emits animation helpers only when the compiled template contains `animate.enter` or `animate.leave`.

The generated helper:

- inspects only nodes in the mounted fragment;
- uses `animationend` and `transitionend` events;
- does not use a global observer;
- does not use repeated timers;
- removes nodes directly when no leave animation is present.

## Security model

Animation values are validated as class names. The first implementation does not allow JavaScript expressions in animation values.

Allowed:

```html
<div animate.enter="fade-in scale-in"></div>
```

Rejected:

```html
<div animate.enter="doSomething()"></div>
```

Rejected:

```html
<div animate.enter="fade-in;alert(1)"></div>
```

## Current scope

Supported:

- static `animate.enter`
- static `animate.leave`
- enter animation on initial render and mounted fragments
- leave animation for removed `@if` and `@for` nodes

Not yet supported:

- expression-bound animation values
- route transition API
- reusable animation triggers
- animation callbacks

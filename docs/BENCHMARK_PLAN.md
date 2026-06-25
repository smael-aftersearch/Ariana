# Ariana Benchmark Plan

Ariana's performance goal must be measured carefully.

We should not claim that Ariana is faster than React in every possible situation. Instead, Ariana should target lower framework overhead in scenarios where fine-grained reactivity can win.

---

## Main hypothesis

Ariana should outperform React in these categories after v2 compiler work:

- signal-bound text updates
- single property/class updates
- single row update in a large table
- form typing with many fields
- derived state updates
- memory allocation during updates

---

## Why React can be slower in these cases

React commonly updates through this path:

```txt
state change
  -> component function reruns
  -> virtual tree is created
  -> reconciliation checks changes
  -> DOM is patched
```

Ariana's target path is:

```txt
signal change
  -> exact dependent binding runs
  -> exact DOM node is patched
```

---

## Benchmark groups

### 1. Counter update

- one signal
- one text binding
- one button click
- measure update cost over many clicks

### 2. Many text bindings

- 1,000 text bindings
- update one signal
- measure how many DOM nodes update

### 3. Large table initial render

- render 1,000 rows
- render 10,000 rows
- measure initial render time

### 4. Single row update

- render large list
- update one row
- verify only related row binding changes

### 5. Row swap

- keyed list
- swap two rows
- measure DOM operations

### 6. Form typing

- 100 fields
- type into one field
- measure unrelated field updates

### 7. Memory allocation

- update loops
- measure retained objects and allocations where tooling allows

---

## Important rule

Do not run official React comparisons against Ariana v1 runtime renderer.

The v1 renderer is intentionally temporary and uses runtime template parsing. Official benchmarks should start after v2 compiler-generated DOM instructions exist.

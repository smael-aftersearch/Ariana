# Ariana 0.5.0 Release Readiness

Ariana is closer to a 0.5.0 milestone, but should only be released after the full quality gate is green.

## Ready pieces

- npm package staging exists
- tarball inspection exists
- install smoke exists
- generated app smoke exists
- Vite fixture exists
- create-ariana is included in root build
- compiler typecheck subpath exists
- query invalidation API exists
- FormArray groundwork exists
- lazy router groundwork exists
- cleanup scope reaches compiled render context
- benchmark smoke workflow exists
- framework comparison benchmark exists
- 0.5 candidate packaging helper exists

## Required before tagging 0.5.0

- main CI is green
- Vite fixture workflow is green
- Benchmark Smoke workflow is green
- Framework Bench workflow is green
- generated app smoke passes
- tarball inspection passes
- 0.5 candidate packaging helper passes
- release checklist is complete
- release notes are reviewed

## Version decision

Do not publish 0.4.2 unless a small urgent package or CI fix is needed.

Use 0.5.0 for the next coherent public milestone.

## Performance test reminder

Benchmark smoke must run before release.

Framework comparison must run before any public performance claim against React, Vue, Solid, or Svelte.

The comparison result should be reported as a narrow reactivity/update benchmark, not as proof of total framework superiority.

# Version One Patch 01

Patch 01 starts the stable API governance track.

## Completed

- Added version one patch plan.
- Added stable API surface registry.
- Added stable API docs check script.
- Added stable API docs check command.
- Added stable API docs check to CI.

## Why this matters

Version one needs a stable public contract before large runtime and compiler changes are locked.

The stable API registry is the first source of truth for what must be documented, tested, and protected before release.

## Next patch

Patch 02 should focus on runtime lifecycle:

- child component cleanup
- nested cleanup scope propagation
- bootstrap destroy tests
- compiled render cleanup tests
- event listener cleanup verification

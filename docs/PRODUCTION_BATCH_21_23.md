# Production Batch 21 to 23

Completed together:

- workflow install failure fix follow-up
- release verification hardening
- compiler package release docs
- Vite plugin compiler metadata sync
- publish workflow production gates

## Install mode decision

The repository currently has no root lock file. Workflows therefore use regular npm install commands. This avoids clean-install failures in GitHub Actions during the alpha track.

Before beta or stable release, generate and commit the root package lock file, then switch workflows back to clean install mode and package-manager cache.

## Release verification

The release verification script now checks:

- required root files
- root build script
- root test script
- package metadata
- package README files
- dist outputs
- package versions
- main and types fields
- package build scripts
- compiler peer or dependency declaration for the Vite plugin
- package archive count

## Publish workflow

The publish workflow now runs install, build, unit tests, release verification, then dry-run or real publish.

It also supports version tag publishing through tags that start with `v`.

## Notes

A separate publish precheck script was attempted but blocked by the connector. The same important checks were added into the release verification script instead.

## Next

`prod-24-ci-status-followup`

# Ariana Final Release Status

This document records the final completion pass for the current preview release.

## Completed

- Root release metadata prepared.
- Package tarball generation prepared.
- Guarded npm publish script prepared.
- Release verification script prepared.
- GitHub CI workflow prepared.
- GitHub npm publish workflow prepared.
- Release documentation prepared.
- Package tarballs included in the ZIP release artifact.

## Not executed by the assistant environment

Actual npm publishing was not executed from this environment because authenticated npm access and scope ownership are required.

## How to publish

Run release verification, generate package tarballs, then publish from an authenticated npm environment.

The GitHub Actions npm publish workflow can also be used after configuring the npm secret in repository settings.

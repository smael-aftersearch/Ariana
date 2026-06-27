# Publish Ariana 1.0 from GitHub Actions

Ariana 1.0 should be published from GitHub Actions, not from a local machine.

## Required secret

Create this repository secret before running the workflow:

```text
NPM_TOKEN
```

The token must be allowed to publish public packages under this scope:

```text
@ariana-framework
```

## Workflow

Use the manual workflow:

```text
Publish Ariana 1.0
```

It runs only from `main` and requires this confirmation input:

```text
publish-1.0.0
```

## What the workflow does

1. Checks out the repository.
2. Installs dependencies.
3. Runs `npm run release:gates:v1`.
4. Publishes with `npm run publish:v1` using `secrets.NPM_TOKEN`.

## Safety rules

- Do not run the workflow until release gates have already passed locally or in CI.
- Do not use a personal machine for the final publish.
- Keep the token in GitHub Secrets only.
- Revoke or rotate the token after the release if it is a one-time token.

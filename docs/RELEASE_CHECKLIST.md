# Release Checklist

Last updated: 2026-06-04

## Current Target

Target release: `v0.9.0`

Purpose:

- package the current maintainer-readiness work into a visible tagged release
- give the Codex OSS support brief a concrete release signal
- keep release steps simple enough for a solo maintainer

## Pre-Release Checks

Before tagging:

```bash
node --test
node src/cli.js --version
```

Expected version:

```text
0.9.0
```

Review these files:

- `package.json`
- `src/cli.js`
- `README.md`
- `CHANGELOG.md`
- `docs/CODEX_OSS_SUPPORT_BRIEF.md`
- `docs/MAINTAINER_WORKFLOW.md`
- `CONTRIBUTING.md`

## Tagging

Create an annotated tag after the release commit lands on `main`:

```bash
git tag -a v0.9.0 -m "v0.9.0"
git push origin main
git push origin v0.9.0
```

## Release Notes Draft

Title:

```text
v0.9.0 - Maintainer readiness release
```

Body:

```markdown
This release makes `agentsmd` easier to evaluate as open-source Codex infrastructure.

Highlights:

- Adds a documented Codex maintainer workflow for issue triage, build planning, PR review, verification, and release notes.
- Adds CONTRIBUTING and CHANGELOG docs.
- Adds GitHub issue templates for bug reports, capability-card proposals, and runner safety reviews.
- Adds a GitHub Actions workflow running `node --test`.
- Keeps third-party execution disabled; capability runners still write first-party handoff packages only.

Verification:

- `node --test`
```

## After Release

Update `docs/CODEX_OSS_SUPPORT_BRIEF.md` so "tagged release" moves from missing evidence to current evidence.

# Changelog

All notable changes to this project are recorded here.

The project is pre-1.0.0, so minor versions may still adjust CLI shape while preserving the documented safety model.

## Unreleased

- Recorded `v0.9.0` as tagged-release evidence in the Codex OSS support brief.
- Added a sample maintainer workflow walkthrough under `examples/maintainer-workflow/`.
- Added publish-ready `v0.9.0` release notes under `docs/releases/`.

## 0.9.0

- Added a documented Codex maintainer workflow covering issue triage, planning, handoffs, pull request review, verification, and release notes.
- Added contributor onboarding, release history, GitHub issue templates, and a `node --test` CI workflow.

## 0.8.0

- Added first-party capability handoff packages for runner-enabled cards.
- `agentsmd capabilities run ai-writing-humanizer --input <path> --yes` can now write a local handoff package under `.agentsmd/runs/...`.
- Handoff packages include `input-manifest.json`, `command.json`, `prompt.md`, `input.md`, `stdout.txt`, `stderr.txt`, and `RUN.md`.
- Third-party execution remains disabled.

## 0.7.0

- Added preview-only capability runner planning.
- Added safety flags, argv rendering, consent messaging, and predictable output directory planning for `capabilities run`.
- Promoted `ai-writing-humanizer` as the first guarded runner candidate.

## 0.6.0

- Documented the local runner safety model.
- Defined no auto-install, no shell by default, explicit consent, predictable output directories, and untrusted-input handling before third-party execution.

## 0.5.0

- Completed Level 1 fixture demos for all bundled capability cards.
- Added committed inputs, expected outputs, and explanations for each initial card.

## 0.4.0

- Added fixture-demo rendering for capability cards.
- Introduced `agentsmd capabilities demo <id>`.

## 0.3.0

- Added the initial static capability registry.
- Added six source-grounded capability cards across documents, codebase, and design-copy families.

## 0.2.0

- Clarified `agentsmd` as the first practical Vibe Builder Toolkit tool.
- Tightened positioning around agent operating documents, build plans, and Codex-ready workflows.

## 0.1.0

- Created the initial `agentsmd` CLI.
- Added config generation for `AGENTS.md`, `CLAUDE.md`, Cursor rules, and `.mcp.json`.
- Added the recipe conductor with `plan`, `run`, `run --verify`, and `status`.

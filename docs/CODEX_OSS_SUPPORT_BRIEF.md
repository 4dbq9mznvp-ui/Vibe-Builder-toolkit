# Codex OSS Support Brief

Last updated: 2026-06-04

## Purpose

This brief prepares Vibe Builder Toolkit / `agentsmd` for OpenAI Codex-related open-source support applications.

It is intentionally conservative. The project should not claim to be critical open-source infrastructure yet. The current, defensible claim is that it is open-source tooling for Codex-assisted builders and maintainers: it keeps agent instructions synchronized, makes build steps reviewable, and turns useful AI tools into capability cards, first-party Codex handoffs, and safe local preview outputs.

## Official Program Signals

### Codex for Open Source

Source: https://openai.com/form/codex-for-oss/

What the program asks for:

- GitHub username with public visibility
- GitHub repository URL with public visibility
- maintainer role, such as primary maintainer or core maintainer
- why the repository qualifies, including usage, ecosystem importance, or active maintenance burden
- OpenAI Organization ID
- how API credits would be used

What selected maintainers may receive:

- ChatGPT Pro for six months
- API credits for pull request review, issue triage, maintainer automation, release workflows, and core OSS work
- possible Codex Security access when deeper security coverage is relevant

Fit assessment:

- Codex for Open Source becomes stronger after adoption signals grow.
- Current blockers: no strong usage signal yet, no public contributor load yet, no release cadence evidence yet.
- Current strength: the repo is directly about making Codex-based work more reviewable and maintainable.

### Codex open source fund

Source: https://openai.com/form/codex-open-source-fund/

The Open Source Fund is the stronger near-term fit because it supports open-source projects using Codex CLI and OpenAI models, with grants up to $25,000 in API credits reviewed on an ongoing basis.

The form asks:

- which open-source project is represented
- a brief project description
- GitHub repository URL
- who is working on the project
- how API credits would be used

## Project Positioning

One-sentence positioning:

> Vibe Builder Toolkit turns scattered open-source AI tools into source-grounded capability cards, fixture demos, safe local previews, and Codex-ready handoffs for AI-native builders.

More specific `agentsmd` positioning:

> `agentsmd` is the first Vibe Builder Toolkit tool: a zero-dependency Node CLI that generates Codex, Claude Code, Cursor, and MCP operating files from one project profile, tracks build steps, and produces safe Codex handoff packages and first-party preview outputs for capability cards.

What this is not:

- not a hosted AI app store
- not a broad tool directory
- not a clone of existing design-agent canvases
- not an automatic third-party execution platform yet
- not a claim of critical ecosystem adoption yet

## Evidence In This Repository

Current evidence:

- zero-runtime-dependency Node CLI
- generated `AGENTS.md`, `CLAUDE.md`, Cursor rules, and `.mcp.json` from one source
- `gen --ai` for Korean profile to English `AGENTS.md`
- recipe conductor with `plan`, `run`, `run --verify`, and `status`
- six source-grounded capability cards with fixture demos
- first-party Codex handoff package and local cleanup preview for `ai-writing-humanizer`
- documented local runner safety model
- tests covering generation, recipes, capability cards, runner preview, handoff output, and local preview output
- CHANGELOG
- CONTRIBUTING guide
- GitHub issue templates for bugs, capability-card proposals, and runner safety reviews
- GitHub Actions workflow running `node --test`
- documented Codex maintainer workflow for issue triage, pull request review, verification, and release notes
- sample maintainer workflow walkthrough
- v0.9.0 release checklist
- tagged v0.9.0 release
- publish-ready v0.9.0 release notes

Evidence still needed:

- real adoption signals such as stars, forks, external users, or recurring contributors

## Suggested Application Answers

### Brief description of the project

Vibe Builder Toolkit is an open-source capability layer for AI-native builders. Its first tool, `agentsmd`, keeps Codex, Claude Code, Cursor, and MCP instructions synchronized from one profile, tracks reviewable build steps, and turns capability cards into safe Codex handoff packages and first-party local previews.

### Why does this repository qualify?

The project targets real Codex maintainer workflows: consistent agent instructions, reviewable build plans, capability cards, safety checks, and handoff artifacts for PR review and release work. It is early, but directly aligned with reducing coding and review load in open-source maintenance.

### How would API credits be used?

API credits would be used to test `gen --ai`, generate and evaluate Codex-ready maintainer workflows, create release-note and PR-review examples, and validate capability-card handoffs and local previews across sample projects without asking early open-source users to spend their own credits.

### Anything else to know

The project is intentionally attribution-safe: it references useful open-source tools by source URL, avoids vendoring third-party code, and keeps third-party execution disabled until safety controls, consent, output paths, and tests exist.

## Near-Term Work To Improve Fit

1. Start collecting adoption evidence from stars, issues, forks, external users, or recurring contributors.
2. Keep any application draft in a private workspace, fill personal fields there, and submit the Codex Open Source Fund form first.

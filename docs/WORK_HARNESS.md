# Work Harness

Last updated: 2026-06-08

## Purpose

Use this lightweight harness before and after project work. It is not a heavy process, a long template, or a runner platform. It is a short operating check that keeps the public OSS core useful, keeps private product work out of public docs, and prevents planned ideas from being described as shipped features.

Keep the record small. A final handoff can be five or six bullets in the agent reply, PR note, issue comment, or run summary. Do not create extra paperwork unless it helps the next agent continue.

## Start Check

Before changing files, run or review:

```bash
git fetch --all --prune
git status --short --branch
```

Read the current boundary and direction:

- `AGENTS.md`
- `docs/OPEN_CORE_BOUNDARY.md`
- `docs/EXTERNAL_WORKFLOW.md`
- `docs/vibe-stack-builder/DESIGN.md`
- `CHANGELOG.md`

Ask:

- Is this public core work or private product work?
- Is this docs, demo, CLI, tests, release, or deployment work?
- Is this implementation, a planning note, or an experiment?
- Can it be described as a live feature, or must it be labeled `planned`, `experiment`, or `private idea`?
- Does the task belong in this repo, an ignored `private/` note, or a separate private repo?

## Scope Check

Keep the work shallow unless the user explicitly asks for a larger build.

- Can the change be explained in one commit?
- Can it be done without new runtime dependencies?
- Is it staying away from automatic execution, accounts, billing, personalization, rankings, or proprietary routing?
- Is the current need core structure, UI polish, public docs, or private strategy?
- If the work is growing into a platform, runner, workflow engine, or hosted product, stop and split it into a smaller public-core step.

## Build Check

- Keep zero runtime dependencies unless there is a strong documented reason.
- Keep ESM and explicit `.js` extensions in relative imports.
- Do not hand-edit generated agent files. Update `agentsmd.config.json`, then regenerate.
- Do not hand-edit `docs/vibe-stack-builder/data.js`; it is generated from `capabilities/*.json`.
- Keep capability-card data public, source-grounded, and permission-safe.
- Public demos must use real public card data only.
- Keep third-party execution disabled until a reviewed adapter and documented `run --auto` design exist.

## Boundary Check

Public repo material:

- OSS CLI behavior
- capability cards and schema
- tests and fixtures
- public examples and demos
- safety, release, contributor, and maintainer workflow docs

Private material:

- product strategy
- proprietary routing, ranking, or recommendation logic
- hosted app plans
- user accounts, billing, growth, or monetization
- customer notes and local run history
- Codex/OpenAI application drafts

If private context needs to inform public docs, write a sanitized public version. Do not link public docs to private files.

## Implementation Honesty

- `built` means it exists in the shipped CLI, docs, or demo.
- `planned` means it is intentionally not built yet.
- `experiment` means it is exploratory and not part of the stable public workflow.
- `private idea` means it belongs outside tracked public files.

Workflow Rail, Build Rail, and train-style assembly UI are product direction ideas until implemented. Do not describe them as an automatic execution platform, live runner, or shipped workflow engine.

## Verification Check

Choose verification based on what changed:

- JS change: run `node --check <file>` for touched JS files.
- Full repo change: run `node --test`.
- Generated files changed: run the generator from the source of truth and inspect the diff.
- Vibe Stack Builder data changed: run `node docs/vibe-stack-builder/build-data.mjs`.
- Web UI changed: decide whether GitHub Pages needs deployment.
- GitHub Pages changed: confirm the live URL returns HTTP 200.

Do not say work is complete, shipped, passing, or live unless the relevant check was run in the current session. Say clearly when something was not verified.

## Handoff Check

End each task with a short handoff:

- Changed files
- Why they changed
- What was intentionally not done
- Verification run
- Public/private boundary result
- Suggested next step, if useful

The handoff is a memory aid for the next agent, not a status report novella.

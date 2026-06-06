# Open Core Boundary

Last updated: 2026-06-06

## Purpose

This repository is the public open-source core for `agentsmd` and the Vibe Builder Toolkit capability-card system.

The public repo should stay useful on its own: installable CLI, generated agent instructions, capability cards, fixture demos, safety docs, tests, and maintainer workflows. Product strategy, private positioning notes, user logs, and proprietary routing ideas should stay outside the tracked public tree.

## Public Core

Keep these in this repository:

- `src/`, `test/`, `recipes/`, and generated templates
- `agentsmd.config.json` as the public single source of truth
- generated `AGENTS.md`, `CLAUDE.md`, Cursor rules, and `.mcp.json` with placeholder env values
- `capabilities/*.json` cards with source URLs, license notes, risks, verification, prompts, and fixture demos
- docs that explain current behavior, safety boundaries, contribution flow, releases, and public maintainer workflows
- examples that use synthetic or permission-safe input

## Private Layer

Keep these out of tracked public files:

- product strategy, monetization, pricing, partnerships, or launch plans
- private Codex/OpenAI support application drafts
- proprietary curation, ranking, or workflow-routing logic
- user project logs, real customer examples, and local run history
- paid playbooks, workshops, or unpublished market research
- real secrets, `.env` files, API keys, and non-placeholder MCP values

Use the ignored `private/` directory for local notes that should not be committed here. The current local split keeps these files there:

- `private/PRODUCT_STRATEGY.md`
- `private/CODEX_OSS_APPLICATION_DRAFT.md`

If a private note needs to become public, create a sanitized public version under `docs/` instead of linking to the private file.

## Separate Private Repo

If the product layer grows, make it a separate private repository rather than a subdirectory tracked here.

Suggested split:

```text
Public OSS repo:
Vibe-Builder-toolkit
- agentsmd CLI
- capability-card schema and safe cards
- fixture demos
- public safety and maintainer docs

Private product repo:
Vibe-Builder-OS-private
- Vibe Stack Builder product strategy
- proprietary routing and recommendation logic
- private application drafts
- launch, monetization, and customer notes
```

## Pre-Publish Check

Before pushing a release or making the repository public, run:

```bash
git status --short
git ls-files private .private .agentsmd .env .env.local tmp
rg -n "sk-|OPENAI_API_KEY=|GITHUB_PERSONAL_ACCESS_TOKEN=|password|secret" .
node --test
node src/cli.js gen
```

Expected result:

- no private, local run, env, or scratch files are tracked
- real secrets do not appear in tracked files
- `.mcp.json` uses `${VAR}` placeholders
- generated agent files match `agentsmd.config.json`
- tests pass

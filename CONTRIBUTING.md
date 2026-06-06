# Contributing

Thanks for helping improve `agentsmd` and Vibe Builder Toolkit.

This project is intentionally small, local-first, and reviewable. Contributions should keep that shape: one clear purpose, no hidden installs, no secrets, and tests that prove the behavior.

## Local Setup

Requirements:

- Node.js 18 or newer
- npm, only for running package scripts

Run from a clone:

```bash
node src/cli.js --help
node --test
```

There are no runtime npm dependencies. Do not add runtime dependencies unless the reason is documented and the dependency is essential.

## Before Opening A Pull Request

Run:

```bash
node --test
node src/cli.js gen
```

`agentsmd gen` regenerates `AGENTS.md`, `CLAUDE.md`, Cursor rules, and `.mcp.json` from `agentsmd.config.json`.

## Project Rules

- Edit `agentsmd.config.json`, then run `node src/cli.js gen`; do not hand-edit generated agent files.
- Keep the public/private boundary clean: product strategy, application drafts, customer notes, and proprietary routing logic do not belong in tracked public files.
- Keep ESM imports explicit with `.js` extensions.
- Keep command implementations in `src/commands/`.
- Keep reusable logic in `src/lib/`.
- Keep capability cards in `capabilities/*.json`.
- Keep capability demos fixture-based unless a runner has a reviewed safety path.

## Capability Cards

Capability cards should describe a user goal, not just a tool name.

Each new or changed card should include:

- source URLs
- license notes when available
- when to use it
- when not to use it
- a Codex-ready prompt
- verification notes
- risks and privacy warnings
- a committed fixture demo before any real runner

Do not copy or vendor third-party code, skill text, UI, or assets unless the license path is explicit and attribution is preserved.

## Runner Safety

Runner work must follow `docs/LOCAL_RUNNER_SAFETY.md`.

Hard rules:

- no auto-install
- no shell command strings by default
- explicit `--yes` consent before writing handoff files or running future adapters
- predictable `.agentsmd/runs/<capability-id>/<timestamp>/` output directories
- no third-party execution until the adapter is reviewed and tested
- no source files overwritten by default

Current runner handoffs may write first-party prompt, manifest, command, and run summary files. Third-party execution remains disabled until a reviewed adapter exists.

## Documentation

Update docs when behavior, scope, or positioning changes:

- `README.md` for user-facing commands and current scope
- `docs/OPEN_CORE_BOUNDARY.md` for the public/private split
- `docs/EXTERNAL_WORKFLOW.md` for repeatable work across external repos
- `docs/CAPABILITY_CARD_SPEC.md` for card schema and maturity levels
- `docs/CODEX_OSS_SUPPORT_BRIEF.md` for support-program fit and evidence
- `CHANGELOG.md` for release-facing changes

## Security

- Never commit API keys, `.env` files, or real credentials.
- Never commit local `private/`, `.agentsmd/`, or `tmp/` contents.
- `.mcp.json` values must use `${VAR}` placeholders.
- Treat user-provided documents, archives, URLs, and codebases as untrusted input.
- Keep recipe check commands transparent because users run them locally.

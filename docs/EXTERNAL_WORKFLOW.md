# External Workflow

Last updated: 2026-06-06

## Purpose

Use this workflow when working on this project from another machine, another clone, or an external client/project repo. The goal is to keep the same reviewable loop everywhere:

```text
profile -> generated agent instructions -> plan -> agent handoff -> verification -> status/release note
```

## One-Time Setup

Requirements:

- Node.js 18 or newer
- npm only for package script convenience
- no runtime dependencies for `agentsmd`

From this repo:

```bash
node src/cli.js --help
node --test
node src/cli.js gen
```

In another project that wants the same workflow:

```bash
npx agentsmd init
# edit agentsmd.config.json
npx agentsmd gen
```

If using a local clone instead of the published package, run the CLI from this repository path or add an npm link intentionally. Do not copy generated `AGENTS.md` by hand; copy the profile shape into `agentsmd.config.json` and regenerate.

## Daily Loop

1. Update `agentsmd.config.json` when project rules, commands, safety constraints, or priorities change.
2. Run `agentsmd gen` so Codex, Claude Code, Cursor, and MCP files stay in sync.
3. Create or inspect the current plan:

```bash
agentsmd plan "<goal>"
agentsmd run
```

4. Paste the current step prompt into Codex, Claude Code, or Cursor with relevant file context.
5. Implement the change in the target repo.
6. Run the verification command shown by the plan, plus the repo's normal tests.
7. Advance the plan only after checks pass:

```bash
agentsmd run --verify
agentsmd status
```

For this repository, the required verification command is:

```bash
node --test
```

## Capability Handoffs

Use capability cards when the work needs a reusable builder skill:

```bash
agentsmd capabilities search "<goal>"
agentsmd capabilities show <id>
agentsmd capabilities demo <id>
agentsmd capabilities prompt <id>
```

For runner-enabled cards, preview before writing files:

```bash
agentsmd capabilities run ai-writing-humanizer --input draft.md
agentsmd capabilities run ai-writing-humanizer --input draft.md --yes
```

Runner handoffs write to `.agentsmd/runs/<capability-id>/<timestamp>/`, which should stay local and ignored. Review `RUN.md`, `prompt.md`, `input.md`, and any preview output before replacing source files.

## Public/Private Rule

External work should follow the same open-core boundary:

- keep public OSS behavior, schemas, examples, tests, and safety docs in the public repo
- keep product strategy, private applications, customer notes, paid workflow details, and proprietary routing logic in a private repo or ignored `private/` folder
- never commit `.env`, local run outputs, or real credentials
- keep `.mcp.json` env values as `${VAR}` placeholders

See [Open Core Boundary](OPEN_CORE_BOUNDARY.md).

## Agent Instruction Carryover

Each repo should carry its own generated instruction files:

- `AGENTS.md` for Codex and compatible agents
- `CLAUDE.md` for Claude Code
- `.cursor/rules/agentsmd.mdc` for Cursor
- `.mcp.json` for MCP-aware clients

The workflow should come from `agentsmd.config.json`, not from memory or manual edits. If external agents behave differently, regenerate the files first, then verify that the relevant tool is reading the generated file.

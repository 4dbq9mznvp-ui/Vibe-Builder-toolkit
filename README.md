# agentsmd

> The first tool in **Vibe Builder Toolkit / 바이브빌더 툴킷**.

**One project profile -> every agent config. One build plan -> reviewable agent work.**

`agentsmd` turns a single project profile (`agentsmd.config.json`) into the instruction files AI coding agents read: `AGENTS.md` for Codex, `CLAUDE.md` for Claude Code, Cursor rules, and `.mcp.json` for MCP-aware clients. It also provides a small conductor for multi-step builds: pick a recipe, show the next agent prompt, run the verification command, and track progress.

Write the project context in Korean if that is how you think. `agentsmd` keeps the generated operating documents clear, concrete, and agent-friendly.

## Where this fits

Vibe Builder Toolkit is not meant to be another GitHub link list, AI tool directory, MCP catalog, or prompt dump.

The larger direction is an open-source capability layer for AI-native builders: take useful open-source AI tools and turn them into skill cards, 10-second demos, Codex-ready instructions, review checklists, build logs, and portfolio-ready outputs.

`agentsmd` is the first practical piece of that system. It focuses on the foundation: keeping agent instructions in sync and making agent-assisted builds trackable instead of vibes-only.

See:

- [Product strategy](docs/PRODUCT_STRATEGY.md)
- [Capability card spec](docs/CAPABILITY_CARD_SPEC.md)
- [Capability cards](capabilities/README.md)

## Why

If you use Codex, Claude Code, and Cursor on the same project, you often maintain overlapping instruction files by hand. They drift. Teams and solo builders also lose track of which prompt was used, which verification command passed, and what the current build step is.

`agentsmd` makes those documents generated artifacts of one source of truth and adds a conductor so each step has:

- a prompt for the coding agent
- a verification command
- a done criterion
- tracked progress in `.agentsmd/`

This is **not** a coding agent. It does not replace Codex, Claude Code, or Cursor. It prepares the operating context around them.

## Install

```bash
# zero runtime dependencies; needs Node >= 18
npx agentsmd <command>

# or, from a clone:
node src/cli.js <command>
```

## Quickstart

```bash
agentsmd init
# edit agentsmd.config.json: stack, commands, conventions, security, MCP servers...

agentsmd gen
# -> AGENTS.md, CLAUDE.md, .cursor/rules/agentsmd.mdc, .mcp.json

agentsmd plan "Supabase email auth MVP"
# -> .agentsmd/BUILD_PLAN.md + state

agentsmd run
# shows the current step: prompt + verification command + done criterion

# do the work with Codex / Claude Code / Cursor...

agentsmd run --verify
# runs the step check; on pass, advances

agentsmd status
# progress at a glance
```

## AI Mode

`gen --ai` can generate an English-optimized `AGENTS.md` from your project profile through the OpenAI API. Other targets stay template-based.

```bash
export OPENAI_API_KEY=sk-...
agentsmd gen --ai

# choose a model your key can access
agentsmd gen --ai --model gpt-4o-mini

# preview the prompt without calling the API
agentsmd gen --ai --dry-run
```

Without an API key, template mode works fully offline:

```bash
agentsmd gen
```

## What `gen` produces

| Target | File | Read by |
|---|---|---|
| `agents` | `AGENTS.md` | Codex and other agentic coding tools |
| `claude` | `CLAUDE.md` | Claude Code |
| `cursor` | `.cursor/rules/agentsmd.mdc` | Cursor |
| `mcp` | `.mcp.json` | MCP-aware clients |

Generate a subset with:

```bash
agentsmd gen --targets agents,mcp
```

## Recipes & conductor

A recipe is a reusable build workflow: ordered steps, each with the agent prompt, a verification command, and a done criterion.

```bash
agentsmd plan --list
agentsmd plan --recipe nextjs-supabase-auth
agentsmd run
agentsmd run --verify
agentsmd run --skip
```

Bundled recipes:

- `demo-hello`: runnable smoke test
- `nextjs-supabase-auth`: realistic Next.js + Supabase auth workflow

State lives in `.agentsmd/state.json`; the readable build plan lives in `.agentsmd/BUILD_PLAN.md`.

## Scope

**v0.2.0 (current)**

- `init`: create a starter `agentsmd.config.json`
- `gen`: generate Codex, Claude Code, Cursor, and MCP config files from one profile
- `gen --ai`: generate an English-optimized `AGENTS.md` through the OpenAI API
- `plan` / `run` / `status`: guide a semi-automatic build workflow that the user still drives

**Planned next**

- `run --auto`: optional direct invocation of Codex or Claude Code, with explicit user control
- TypeScript migration
- larger recipe library
- TUI dashboard
- Vibe Builder skill cards: small runnable demos for capabilities like PDF cleanup, codebase understanding, AI writing review, UI taste review, build logs, and portfolio generation

## What this is not yet

- not a full AI app store
- not a community platform
- not an automated ranking engine
- not a replacement for Codex, Claude Code, Cursor, or MCP tools
- not a copy of existing design-agent canvases; future capability cards should use original Vibe Builder information architecture and attribution-safe implementations

## License

MIT - see [LICENSE](./LICENSE).

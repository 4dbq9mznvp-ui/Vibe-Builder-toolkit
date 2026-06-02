# agentsmd

**Single source → every agent config. Plus a semi-automatic vibe-building conductor.**

`agentsmd` turns one project profile (`agentsmd.config.json`) into the instruction files every AI coding agent reads — `AGENTS.md` (Codex), `CLAUDE.md` (Claude Code), Cursor rules, and `.mcp.json` — and keeps them in sync. Then it conducts a tracked, step-by-step build that *you* drive with your agent of choice.

> 한국어로 프로젝트를 정의하면 → 영어로 최적화된 산출물을 뽑습니다. 한 소스에서 Codex·Claude·Cursor 설정을 동시에 생성하고 동기화합니다. 그리고 바이브 빌딩 과정을 단계별로 추적·검증해 줍니다.

## Why

If you use Codex, Claude Code, and Cursor on the same project, you maintain three or four overlapping instruction files by hand. They drift. `agentsmd` makes them generated artifacts of **one source of truth** — and adds a conductor so multi-step "vibe builds" stay reviewable and trackable instead of vibes-only.

This is **not** a coding agent. It does not replace Codex or Claude Code. It *conducts* them: prepares the right prompt for each step, runs your verification command, tracks progress.

## Install

```bash
# zero dependencies; needs Node >= 18
npx agentsmd <command>
# or, from a clone:
node src/cli.js <command>
```

## Quickstart

```bash
agentsmd init                              # writes agentsmd.config.json
#   edit the config: stack, conventions, security, MCP servers…
agentsmd gen                               # → AGENTS.md, CLAUDE.md, .cursor/rules/, .mcp.json

agentsmd plan "Supabase 이메일 인증 MVP"     # → .agentsmd/BUILD_PLAN.md + state
agentsmd run                               # shows step 1: the prompt to give your agent + how to verify
#   …do the work with Codex / Claude / Cursor…
agentsmd run --verify                      # runs the step's check; on pass, advances
agentsmd status                            # progress at a glance
```

## What `gen` produces

| Target | File | Read by |
|---|---|---|
| `agents` | `AGENTS.md` | Codex & others |
| `claude` | `CLAUDE.md` | Claude Code |
| `cursor` | `.cursor/rules/agentsmd.mdc` | Cursor |
| `mcp` | `.mcp.json` | MCP-aware clients |

`agentsmd gen --targets agents,mcp` to generate a subset. `--dry-run` to preview.

## Recipes & the conductor

A *recipe* is a reusable vibe-building workflow: ordered steps, each with the agent **prompt**, a **verification command**, and a **done-criterion**.

```bash
agentsmd plan --list
agentsmd plan --recipe nextjs-supabase-auth
agentsmd run            # show current step
agentsmd run --verify   # run its check, advance on pass
agentsmd run --skip     # skip current step
```

Bundled recipes: `demo-hello` (a runnable smoke test) and `nextjs-supabase-auth` (realistic).
State lives in `.agentsmd/state.json`; a human-readable plan in `.agentsmd/BUILD_PLAN.md`.

## Scope

**v0.1 (now)**
- ✅ `gen` — configs + MCP from a single source, kept in sync
- ✅ `plan` / `run` / `status` — semi-automatic conductor (you drive the agent)

**Planned**
- ⏳ v0.2 — `--ai` mode (Korean → English via OpenAI API), `run --auto` (invoke Codex/Claude directly), TypeScript migration (agentsmd migrating itself)
- ⏳ v0.3 — recipe library, TUI dashboard

## License

MIT — see [LICENSE](./LICENSE).

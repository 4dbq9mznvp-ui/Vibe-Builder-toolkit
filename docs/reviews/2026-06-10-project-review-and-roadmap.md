# Project Review and Roadmap

Date: 2026-06-10
Scope: full-repo review of `agentsmd` v0.9.0 (public core) plus the Vibe Stack Builder demo, with a prioritized development plan.

## Snapshot

- 53/53 `node --test` tests pass.
- ~1,450 lines of `src/`, ~780 lines of tests, zero runtime dependencies, ESM with explicit `.js` imports — all conventions in `AGENTS.md`/`CLAUDE.md` are actually followed in code.
- Six capability cards, all with Level 1 fixture demos; `ai-writing-humanizer` passes `capabilities review --strict`.
- `v0.9.0` is tagged; release notes exist under `docs/releases/`.
- The Workflow Rail feature has a finished design spec and implementation plan (`docs/superpowers/`), but `docs/vibe-stack-builder/app.js` does not contain `stages` yet — it is designed, not built.

## Strengths

- **Safety model discipline.** The handoff/execution gate split in `reviewCapabilityRunner`, consent separation (`--yes` vs third-party execution), argv-array command plans, and the refusal path in `writeCapabilityRunHandoff` form a coherent, test-backed safety story. This is the project's strongest differentiator and worth protecting.
- **Single source of truth is real.** Generators read `agentsmd.config.json`; generated files carry do-not-edit banners; `data.js` is generated from cards. Docs and code agree.
- **Honest positioning.** README's "What this is not yet" section, `planned` labeling rules in the rail spec, and the open-core boundary docs keep claims aligned with shipped behavior.
- **Korean-first discovery.** `search_terms` with Korean queries plus token-based scoring in `searchCapabilities` matches the stated audience.

## Findings (prioritized)

### F1. README advertises `npx agentsmd`, but the package is not on npm (high)

`npm view agentsmd` returns 404. The very first install instruction in README fails for a new user. Either publish `0.9.x` to npm (the name appears available) or change the install section to clone-based usage until publication. This is the single largest gap between docs and reality.

### F2. Declared runner limits are not enforced in code (high)

`ai-writing-humanizer.json` declares `timeout_ms`, `max_input_bytes`, and `max_output_bytes`, and the execution gates *check that the fields exist* — but `writeCapabilityRunHandoff` reads the input file with no size check and applies no limits. The gate metadata is currently advisory. Before any real adapter ships, `planCapabilityRun`/`writeCapabilityRunHandoff` should enforce `max_input_bytes` (refuse oversized input with a clear message) so the safety model is mechanical, not documentation.

### F3. The first-party humanizer transform is fixture-shaped (medium)

`HUMANIZER_REPLACEMENTS` patterns match the bundled demo text almost verbatim (e.g. the exact "game-changing platform that leverages cutting-edge AI..." sentence). On real-world input it will mostly fall through to the "no patterns matched" message. That fallback is honest, but README's "local cleanup preview" reads stronger than the behavior. Either generalize the pattern set (generic openers, stacked adjectives, hype verbs) or label the transform as a demonstration pass in README and `RUN.md`.

### F4. `gen --ai` supports only the OpenAI API (medium)

A tool whose flagship output is `CLAUDE.md` cannot use the Anthropic API. `src/lib/ai.js` is a single 80-line fetch wrapper; adding a provider switch (`--provider openai|anthropic`, keyed off `ANTHROPIC_API_KEY`) stays zero-dependency and removes an odd asymmetry. Also: the OpenAI call sets no `max_tokens`, which conflicts with the "keep token usage low" intent.

### F5. Version string is duplicated (low)

`VERSION = '0.9.0'` in `src/cli.js` duplicates `package.json`. Read it from `package.json` (`createRequire` or `readFileSync` + `JSON.parse`) so a release bump is one edit.

### F6. Recipe check provenance (low, by design but worth one line)

`run --verify` executes `step.check` via `execSync(..., { shell: true })` from `.agentsmd/state.json`. This is documented ("check commands are code the user runs"), and the command is echoed before running, which is good. Keep the echo; consider a one-line note in `BUILD_PLAN.md` reminding users that edited state files change what `--verify` executes.

### F7. Test gaps (low)

`run.js` / `plan.js` command flows have no integration tests (state transitions on verify-pass, verify-fail, skip). `ai.js` has no failure-path tests (non-OK response, missing content). These are the least-covered files relative to their importance.

## Development plan

### Now (v0.9.x — close the credibility gaps)

1. **Implement the Workflow Rail** per `docs/superpowers/plans/2026-06-09-workflow-rail-recipes-implementation.md`. Design and plan are done; this is the highest-leverage visible improvement and the demo is the public face of the toolkit.
2. **Fix F1**: publish to npm or rewrite the install section. Decide before anything else ships, since every README reader hits it.
3. **Fix F2**: enforce `max_input_bytes` in the handoff writer; add a refusal test. Small diff, makes the safety model real.
4. **Fix F5** while touching the CLI.

### Next (v0.10 — make `--ai` and the conductor stronger)

5. **Multi-provider `gen --ai`** (F4): Anthropic + OpenAI behind one flag, `max_tokens` set, dry-run unchanged. Keeps the "Korean profile -> English AGENTS.md" priority and removes the provider asymmetry.
6. **Generalize or relabel the humanizer transform** (F3), with fixture tests for the generic patterns.
7. **`agentsmd recipes validate` / `capabilities lint`**: schema checks for community-contributed recipes and cards. Cheap to build on the existing `validateCapability`, and it is the prerequisite for accepting outside contributions safely.
8. **Conductor integration tests** (F7).

### Later (v1.0 candidates)

9. **`run --auto` design doc first, then implementation**: invoking Codex/Claude Code from the conductor, reusing the consent model (plan preview without flag, execution with explicit flag). This is the feature that turns the conductor from a checklist into a workflow engine — it deserves the same spec/plan treatment the rail got.
10. **First real third-party adapter**: one low-risk, local-only tool behind the now-enforced execution gates, with the four required tests (`preview`, `missing-tool`, `output-path`, `refusal-without-consent`) actually implemented.
11. **Types via JSDoc before a TypeScript migration**: `// @ts-check` + JSDoc keeps zero dependencies and zero build step while catching most shape errors; revisit full TS only if the codebase outgrows it.
12. **Recipe library growth + TUI dashboard**, in that order — more recipes make the dashboard worth building.

## Suggested release line

- `0.9.x`: rail shipped, npm story fixed, limits enforced — then tag.
- `0.10`: multi-provider AI mode + validation commands.
- `1.0`: npm-published, `run --auto` designed and gated, one reviewed adapter executing for real.

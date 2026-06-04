# Codex Maintainer Workflow

Last updated: 2026-06-04

## Purpose

This document shows how `agentsmd` can support real open-source maintainer work with Codex while keeping the user in control.

The workflow is designed for:

- issue triage
- pull request review
- small implementation planning
- verification
- release note preparation

It is also the concrete example behind the Codex OSS support brief. API credits would be used to test and improve these workflows across sample projects without pushing that cost onto early users.

## Maintainer Scenario

A maintainer receives an issue:

> "The generated `AGENTS.md` is missing a security rule when my profile includes MCP servers."

The maintainer wants Codex to help, but the work still needs to be traceable:

- What did the user report?
- What files and commands are relevant?
- What prompt did Codex receive?
- What verification command passed?
- What release note should describe the change?

`agentsmd` provides the operating layer around that work.

## Workflow

### 1. Issue triage

Use the bug report template to capture:

- exact command
- expected behavior
- actual behavior
- version or commit
- `node --test` output when available

Maintainer triage note:

```markdown
Thanks. This looks related to generated agent docs, not capability cards.

I will check:
- `agentsmd.config.json`
- `src/render/agents.js`
- `src/render/mcp.js`
- `test/render.test.js`

Verification target: `node --test`
```

### 2. Create a reviewable plan

Turn the issue into a build plan:

```bash
agentsmd plan "Fix missing generated security rule for MCP servers"
agentsmd run
```

The output gives Codex a focused next-step prompt and keeps the maintainer from starting with a vague instruction.

For a real repository, the maintainer should paste the current step into Codex with:

- the issue summary
- relevant files
- the verification command
- the done criterion

### 3. Use capability handoffs when a supporting skill is useful

If the maintainer needs to clean up a release note, PR summary, or README section, use the writing capability:

```bash
agentsmd capabilities run ai-writing-humanizer --input draft-release-note.md
```

Review the preview. If the plan is acceptable:

```bash
agentsmd capabilities run ai-writing-humanizer --input draft-release-note.md --yes
```

This writes a Codex handoff package under:

```text
.agentsmd/runs/ai-writing-humanizer/<timestamp>/
```

The handoff includes:

- `prompt.md`
- `input.md`
- `input-manifest.json`
- `command.json`
- `stdout.txt`
- `stderr.txt`
- `RUN.md`

No third-party tool is executed. The package exists so Codex, Claude Code, Cursor, or a human reviewer can inspect the exact prompt, input, and command plan.

### 4. Implementation with Codex

Ask Codex to implement only the current plan step.

Good Codex instruction:

```text
Use the current agentsmd plan step. Keep the change scoped to generated AGENTS.md security rules for MCP servers. Add or update tests first. Do not change unrelated renderer behavior. Run node --test before reporting completion.
```

The maintainer still reviews the diff before accepting it.

### 5. Pull request review

When reviewing the pull request, check:

- Does the diff match the issue?
- Did generated files change only through `agentsmd gen`?
- Are new behaviors covered by tests?
- Does `node --test` pass?
- Are security notes and `.mcp.json` placeholder rules preserved?

Suggested review comment:

```markdown
Reviewed the generated agent-doc change.

Checks:
- [ ] behavior matches the issue
- [ ] generated files were regenerated from `agentsmd.config.json`
- [ ] `node --test` passes
- [ ] no secrets or real env values were added
```

This is where Codex API credits can help with pull request review: summarize the diff, list likely risks, draft review comments, and propose focused follow-up tests.

### 6. Verification

Run:

```bash
node --test
agentsmd run --verify
```

If `agentsmd run --verify` advances the plan, update the issue or pull request with:

````markdown
Verified with:

```text
node --test
agentsmd run --verify
```

Result: all checks passed and the build plan advanced.
````

### 7. Release note

Draft a short release note:

```markdown
Fixed generated `AGENTS.md` security guidance when MCP servers are configured. The generator now preserves placeholder-based environment rules and the regression is covered by `node --test`.
```

If the wording sounds generic, create a handoff:

```bash
agentsmd capabilities run ai-writing-humanizer --input draft-release-note.md --yes
```

Review `prompt.md`, `input.md`, and `RUN.md`, then ask Codex to improve the note without adding new claims.

## API Credits Usage

API credits would be used for:

- generating English `AGENTS.md` from Korean maintainer profiles through `gen --ai`
- summarizing issues into scoped build plans
- drafting pull request review comments from diffs
- generating release note drafts
- evaluating capability-card prompts and handoff outputs across sample projects
- testing maintainer automation without requiring early contributors to pay for model calls

## Safety Boundaries

This workflow does not let Codex or any third-party tool run unchecked.

Rules:

- the maintainer chooses when to ask Codex for help
- `run --auto` is not implemented yet
- capability handoffs write first-party files only
- No third-party tool is executed by `capabilities run`
- generated output stays under `.agentsmd/`
- source files are not overwritten by default
- `node --test` remains the required verification command

## What This Proves

This workflow shows that Vibe Builder Toolkit is not just a prompt collection. It gives maintainers a repeatable operating loop:

```text
issue triage -> plan -> Codex handoff -> implementation -> pull request review -> verification -> release note
```

That loop is the project-level reason to request Codex-related support.

# Maintainer Workflow Example

This example turns `docs/MAINTAINER_WORKFLOW.md` into a concrete, reviewable walkthrough.

It shows how a maintainer can use `agentsmd` around Codex without handing over control:

```text
issue triage -> Codex handoff -> pull request review -> verification -> release note
```

Files:

- `issue.md`: sample user report
- `triage-note.md`: maintainer triage response and file checklist
- `codex-handoff.md`: prompt and context a maintainer can paste into Codex
- `pr-review.md`: pull request review checklist
- `release-note.md`: release note draft

Commands referenced by the walkthrough:

```bash
agentsmd plan "Fix generated AGENTS.md security guidance for MCP servers"
agentsmd run
agentsmd capabilities run ai-writing-humanizer --input examples/maintainer-workflow/release-note.md
agentsmd run --verify
node --test
```

`capabilities run` only creates a first-party Codex handoff package when `--yes` is used. No third-party tool is executed by this walkthrough.

## How API Credits Help

API credits can be used to:

- summarize the issue into a tighter plan
- ask Codex to inspect a focused diff
- draft pull request review comments
- improve the release note without adding unsupported claims
- test the same maintainer loop across sample projects

This is the concrete workflow referenced by the Codex OSS support brief.

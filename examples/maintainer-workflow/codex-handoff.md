# Codex Handoff

Paste this into Codex after running `agentsmd run` for the current plan step.

```text
We are fixing generated agent-doc security guidance for MCP servers.

Context:
- The issue says generated AGENTS.md misses the rule that `.mcp.json` values must use `${VAR}` placeholders.
- Keep the change scoped to generated agent docs and related tests.
- Do not add runtime npm dependencies.
- Do not touch unrelated capability-card behavior.

Relevant files:
- agentsmd.config.json
- src/render/agents.js
- src/render/mcp.js
- test/render.test.js
- AGENTS.md

Requirements:
- Add or update tests first.
- Keep generated files synchronized through `node src/cli.js gen`.
- Preserve the security rule that secrets and `.env` files must not be committed.
- Verification command: `node --test`.

Report back with:
- changed files
- test result
- any residual risk
```

Optional release-note cleanup:

```bash
agentsmd capabilities run ai-writing-humanizer --input examples/maintainer-workflow/release-note.md
```

Review the preview first. If the handoff is useful:

```bash
agentsmd capabilities run ai-writing-humanizer --input examples/maintainer-workflow/release-note.md --yes
```

This writes a Codex handoff package. No third-party tool is executed.

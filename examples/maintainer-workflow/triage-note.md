# Triage Note

Thanks for the clear report. This looks like a generated agent-doc behavior, not a capability-card issue.

Files to inspect:

- `agentsmd.config.json`
- `src/render/agents.js`
- `src/render/mcp.js`
- `test/render.test.js`
- generated `AGENTS.md`

Plan:

```bash
agentsmd plan "Fix generated AGENTS.md security guidance for MCP servers"
agentsmd run
```

Verification target:

```bash
node --test
agentsmd run --verify
```

Safety notes:

- no secrets should be committed
- `.mcp.json` should keep `${VAR}` placeholders
- generated files should be produced through `agentsmd gen`

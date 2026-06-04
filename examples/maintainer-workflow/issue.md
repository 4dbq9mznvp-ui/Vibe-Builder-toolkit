# Sample Issue

Title:

```text
Generated AGENTS.md misses MCP security guidance
```

User report:

```markdown
When my `agentsmd.config.json` includes MCP servers, the generated `AGENTS.md` lists the server names but does not remind contributors to keep `.mcp.json` values as `${VAR}` placeholders.

Expected:

- AGENTS.md should include the security rule
- generated files should stay in sync with `agentsmd.config.json`
- no real API keys should be written

Actual:

- AGENTS.md only lists the MCP server names
- I had to add the security rule by hand

Version:

0.9.0
```

Maintainer labels:

- `bug`
- `agent-docs`
- `security`

# Release Note Draft

Fixed generated `AGENTS.md` security guidance for projects that configure MCP servers.

The generated agent instructions now remind contributors that `.mcp.json` values must use `${VAR}` placeholders and that real secrets or `.env` files must not be committed.

Verification:

```text
node --test
agentsmd run --verify
```

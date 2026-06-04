# Pull Request Review

Review checklist:

- [ ] The diff matches the issue.
- [ ] The change is scoped to generated agent docs and tests.
- [ ] Generated files were updated through `agentsmd gen`.
- [ ] `.mcp.json` still uses `${VAR}` placeholders.
- [ ] No secrets, `.env` files, or real API keys were added.
- [ ] `node --test` passes.
- [ ] `agentsmd run --verify` advances the current build plan when applicable.

Suggested review comment:

````markdown
Thanks. The generated security guidance now matches the MCP placeholder rule.

Verified:

```text
node --test
```

Follow-up:
- Please confirm generated files were updated with `agentsmd gen`.
- No real secret values should be committed.
````

Codex can help summarize the diff and draft review comments, but the maintainer makes the final call.

# Recipe Spec

Last updated: 2026-06-10

A recipe is a reusable build workflow for the `agentsmd` conductor: ordered steps, each with an agent prompt, an optional verification command, and a done criterion. `agentsmd plan` turns a recipe into tracked state under `.agentsmd/`, and `agentsmd run` walks it step by step.

## Where recipes live

| Location | Purpose |
|---|---|
| `recipes/*.json` (bundled) | Recipes shipped with agentsmd |
| `.agentsmd/recipes/*.json` (project-local) | Your own workflows for one project |

Local recipes are discovered automatically by `plan`, `plan --list`, and `recipes list`. A local recipe with the same `name` as a bundled one intentionally overrides it, so you can adapt a bundled workflow without editing this repository.

Local recipe files live under the ignored `.agentsmd/` directory and are not tracked by this repository.

## Format

```json
{
  "name": "my-workflow",
  "title": "Readable workflow title",
  "tags": ["nextjs", "auth"],
  "steps": [
    {
      "id": "scaffold",
      "title": "Scaffold the app",
      "prompt": "Prompt text the user gives to their coding agent.",
      "check": "npm test",
      "done": "Tests pass and the app builds."
    }
  ]
}
```

## Validation rules

`agentsmd recipes validate` enforces:

- `name`: required; lowercase slug (`a-z`, `0-9`, hyphens), e.g. `nextjs-supabase-auth`.
- `title`: required non-empty string.
- `tags`: optional array of strings. Tags are matched against the `plan "<goal>"` text to auto-pick a recipe, so include the words (and Korean terms) a builder would actually type.
- `steps`: required non-empty array.
- `steps[].id`: required non-empty string, unique within the recipe.
- `steps[].title`: required non-empty string.
- `steps[].prompt`, `steps[].check`, `steps[].done`: optional strings.

Unknown extra fields are allowed and ignored, so recipes can carry editorial metadata without breaking older versions.

`plan` and `recipes list` refuse to load an invalid recipe and point to `recipes validate` for the full report.

## Safety expectations for `check` commands

`agentsmd run --verify` executes the step's `check` in a shell, as the user. This is by design — the check is the user's own verification command — but it means recipe authors must follow the documented security rule: **keep check commands transparent and minimal.**

- Prefer the project's own documented commands (`npm test`, `pnpm build`, `node --test`).
- Never download-and-execute, never chain hidden side effects, never touch credentials.
- A reader should understand what a check does from the one line in `BUILD_PLAN.md`.

Recipes contributed to this repository are reviewed against these rules; treat third-party recipe files with the same care as any code you run.

## Commands

```bash
agentsmd recipes list                  # bundled + local recipes
agentsmd recipes validate              # validate all of them
agentsmd recipes validate --file p.json
agentsmd plan --recipe <name>          # use a specific recipe
agentsmd plan "<goal>"                 # tag-match a recipe from the goal
```

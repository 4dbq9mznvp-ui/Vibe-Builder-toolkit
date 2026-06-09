# Workflow Rail Recipes Design

Date: 2026-06-09

## Decision

Implement the first train-style workflow experience by evolving the existing Vibe Stack Builder `Recipes` view into a lightweight `Workflow Rail` composer.

This is public demo work, not private product work. It should stay inside the current static GitHub Pages demo and use only public capability-card data plus small public editorial recipe data.

## Product Intent

The user enters a goal or chooses an example. The demo maps that goal to a public workflow rail: a sequence of small work cars/stages that transform the input into an actionable handoff. Avoid copy that implies proprietary ranking, personalization, or production recommendation logic.

The experience should make the idea visible:

```text
Input -> stage -> stage -> stage -> agent handoff
```

Each stage should explain:

- what role it plays
- which public capability card or built-in toolkit piece supports it
- what can be swapped in that stage
- what warning or verification applies

The final output remains:

- workflow summary
- agent prompt
- next commands
- checks

## Scope

Build the first version as a small extension of the existing `Recipes` mode.

In scope:

- Add rail/stage data to current recipe definitions.
- Render a horizontal or wrapped sequence of stage cars inside the recipe output.
- Allow a user to select a stage option for a stage.
- Reflect selected options in the visible stage details and final prompt/command/check blocks using the merge rules below.
- Keep the existing `Explore` view and inspector behavior.
- Keep copy honest: this is a public demo and handoff composer, not an execution engine.

Out of scope:

- No automatic third-party tool execution.
- No hosted workflow runner.
- No accounts, billing, saved projects, personalization, ranking, or proprietary routing.
- No private strategy or customer examples in public files.
- No new runtime dependencies.
- No generated `data.js` hand edits.
- No copy that presents the rail as a ranked or personalized recommendation engine.

## UX Model

Keep the workbench shape:

```text
[ sidebar ]   [ workspace ]             [ inspector ]
 problems       rail recipe composer       selected tool info
 modes          prompt/commands/checks     copy/open actions
```

For `Recipes`, replace or supplement the current stack chip row with a rail:

```text
Input -> Parse -> Structure -> Rewrite -> Review -> Handoff
```

Each car should be compact and practical:

- number or stage label
- role
- selected option
- tag such as `lightweight`, `local-first`, `review`, or `handoff`

Clicking an option should not execute anything. It should update the composed handoff.

## Data Model

Keep data local to `docs/vibe-stack-builder/app.js` for the first version because current `RECIPES` and `PROBLEMS` already live there as public editorial data.

Add a `stages` array to recipes:

```js
{
  id: "parse",
  label: "Parse",
  role: "Turn source material into AI-readable text.",
  defaultOption: "pdf-to-markdown",
  options: [
    {
      id: "pdf-to-markdown",
      label: "Markdown parser",
      tool: "pdf-to-markdown",
      status: "supported",
      tag: "lightweight",
      prompt: "Convert source material into clean Markdown.",
      command: "agentsmd capabilities show pdf-to-markdown",
      checks: ["Flag uncertain tables or citations."]
    }
  ]
}
```

Rules:

- Stage `id` values are stable.
- Option `id` values are stable inside a stage.
- If an option points to a tool, the tool must exist in public `TOOLS`.
- Supported options use `status: "supported"` and may include a public `tool`.
- Planned or reference-only options use `status: "planned"`, `tool: null`, and a short `supportLabel` such as `Planned` or `Reference only`.
- Planned or reference-only options must not be rendered as active public tool support.
- Preserve current `stack`, `workflow`, `prompt`, `commands`, and `checks` during the first pass for compatibility.

## State

Extend page state with selected options by recipe id and stage id:

```js
state.stageOptions = {
  "document-content": {
    parse: "pdf-to-markdown"
  }
};
```

When a recipe is rendered:

1. Use the selected option if available.
2. Otherwise use the stage `defaultOption`.
3. Otherwise use the first stage option.

## Rendering

Add small pure helpers inside `app.js`:

- `stageOption(stage, selectedId)`
- `selectedStageOptions(route)`
- `composeRouteOutput(route)`

These helpers should be easy to move into a separate module later, but do not split files in this first pass unless the implementation becomes hard to read.

`composeRouteOutput(route)` merge rules:

1. Start from the base route `workflow`, `prompt`, `commands`, and `checks`.
2. Append selected option `prompt` lines to a clearly labeled stage-addendum section in the agent prompt.
3. Append selected option `command` values after base commands.
4. Append selected option `checks` after base checks.
5. De-duplicate exact repeated command and check strings while preserving order.
6. If an option has `status: "planned"`, include its role in the visible rail but exclude its command from copied commands.
7. Keep copied commands transparent; commands are for the user to run manually and the demo must not execute them.

Render blocks:

- `Workflow Rail`: car sequence and option controls
- `Workflow`: existing ordered workflow, optionally enriched by selected option prompts
- `Agent Prompt`: composed text
- `Next Commands`: composed commands
- `Checks`: composed checks

Fallback behavior:

- `FALLBACK` should get a short generic rail: Goal -> Instructions -> Review -> Handoff.
- If a route has no `stages`, keep the existing block rendering and do not show a broken rail.

Inspector behavior:

- Selecting a rail option updates rail details and composed output.
- If the option has a supported `tool`, provide a small `Inspect tool` action that calls the existing `selectTool(toolId)`.
- Do not automatically switch inspector context on option selection; avoid surprising layout jumps.

Command safety:

- Prefer `agentsmd capabilities show`, `agentsmd capabilities demo`, `agentsmd capabilities prompt`, and `agentsmd plan` in first-pass rail option commands.
- Existing `run --yes` examples may remain only when framed as user-run local commands, not as actions the demo performs.

## Example Rails

First pass rails:

1. `document-content`
   - Input
   - Parse
   - Structure
   - Rewrite
   - Review
   - Handoff

2. `repo-handoff`
   - Fetch
   - Instructions
   - Index
   - Plan
   - Verify
   - Handoff

3. `copy-cleanup`
   - Source
   - Meaning lock
   - Rewrite
   - UI context review
   - Handoff

`portfolio-site` can use a smaller rail:

- Intent
- Structure
- Copy
- UI review
- Handoff

## Testing

Add focused tests if pure helpers are moved to `src/` or another importable module. If helpers remain browser-local in `app.js`, verify with:

- `node --check docs/vibe-stack-builder/app.js`
- `node --test`
- manual browser or live page check after deployment

At minimum, the implementation must preserve current route picking and copy blocks.

Before finishing implementation, verify every supported rail option with a `tool` points to a key in public `TOOLS`. Planned/reference-only options must not require a tool key.

CSS changes must use existing `styles.css :root` tokens and avoid new decorative palettes.

## Public Boundary

This feature is allowed in the public repo because it is a static public demo using public cards and public editorial examples.

It must not claim to be:

- an automatic execution platform
- a hosted workflow engine
- a personalized recommendation system
- a proprietary ranking layer

Use language such as `compose`, `handoff`, `public demo`, `selected option`, and `planned` where needed.

## Done Criteria

- Existing Recipes mode shows a rail/stage representation.
- Stage options can be selected without executing tools.
- Final prompt, commands, or checks visibly reflect selected options.
- Supported option `tool` references are validated against public `TOOLS`.
- Planned/reference-only options use explicit `status: "planned"` and do not appear as supported public tooling.
- `FALLBACK` either renders a generic rail or safely preserves the existing block-only recipe output.
- Public/private boundary remains intact.
- `node --check docs/vibe-stack-builder/app.js` passes.
- `node --test` passes.
- If deployed, GitHub Pages returns HTTP 200 and shows the rail UI.

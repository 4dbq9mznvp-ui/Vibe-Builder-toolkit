# Workflow Rail Recipes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing Vibe Stack Builder `Recipes` view into a lightweight Workflow Rail composer without creating an execution engine.

**Architecture:** Keep the feature inside the static `docs/vibe-stack-builder` demo. Extend existing recipe objects with public `stages` data, add small browser-local helpers for selecting stage options and composing handoff output, then render a compact rail UI above the existing prompt/commands/check blocks.

**Tech Stack:** Vanilla HTML/CSS/JS, existing `data.js` generated public cards, zero runtime dependencies, `node --check`, `node --test`.

---

## File Structure

- Modify: `docs/vibe-stack-builder/app.js`
  - Add `stages` data to `RECIPES` and `FALLBACK`.
  - Add helper functions: `uniqueStrings`, `stageOption`, `selectedStageOptions`, `composeRouteOutput`, `supportedToolIds`, `validateRailTools`, `renderRail`.
  - Extend `state` with `stageOptions`.
  - Update `renderRecipe()` to render a `Workflow Rail` block and composed output.
- Modify: `docs/vibe-stack-builder/styles.css`
  - Add compact rail/car/option styles using existing `:root` tokens only.
- Modify: `docs/vibe-stack-builder/DESIGN.md`
  - Mark `Workflow Rail` as built only after implementation is verified.
- Modify: `CHANGELOG.md`
  - Add an Unreleased note after implementation passes.
- Optional Modify: `test/docs.test.js`
  - Add static documentation assertions only if implementation changes require docs test coverage.
- Do not modify: `docs/vibe-stack-builder/data.js`
  - It is generated from `capabilities/*.json`.

## Task 1: Add Rail Data

**Files:**
- Modify: `docs/vibe-stack-builder/app.js`

- [ ] **Step 1: Add `stages` to `document-content`**

Add a `stages` array after `stack`:

```js
    stages: [
      {
        id: "input",
        label: "Input",
        role: "Bring in the source document and decide what must be preserved.",
        defaultOption: "source-document",
        options: [
          {
            id: "source-document",
            label: "PDF or document",
            status: "supported",
            tag: "input",
            prompt: "Treat the source document as the factual boundary for the task.",
            checks: ["Do not add facts that are not present in the source material."],
          },
        ],
      },
      {
        id: "parse",
        label: "Parse",
        role: "Turn the document into AI-readable Markdown.",
        defaultOption: "pdf-to-markdown",
        options: [
          {
            id: "pdf-to-markdown",
            label: "Markdown parser",
            tool: "pdf-to-markdown",
            status: "supported",
            tag: "lightweight",
            prompt: "Convert the supplied document into clean Markdown.",
            command: "agentsmd capabilities show pdf-to-markdown",
            checks: ["Preserve headings and lists."],
          },
          {
            id: "layout-aware-pdf-parse",
            label: "Layout-aware parse",
            tool: "layout-aware-pdf-parse",
            status: "supported",
            tag: "layout",
            prompt: "Use layout-aware parsing where tables, citations, or page positions matter.",
            command: "agentsmd capabilities demo layout-aware-pdf-parse",
            checks: ["Flag uncertain tables, citations, and page positions for manual review."],
          },
        ],
      },
      {
        id: "rewrite",
        label: "Rewrite",
        role: "Turn the parsed notes into builder-facing content.",
        defaultOption: "ai-writing-humanizer",
        options: [
          {
            id: "ai-writing-humanizer",
            label: "Humanized rewrite",
            tool: "ai-writing-humanizer",
            status: "supported",
            tag: "copy",
            prompt: "Rewrite the parsed document into concise builder-facing content without adding new facts.",
            command: "agentsmd capabilities prompt ai-writing-humanizer",
            checks: ["Cut generic AI phrasing while preserving factual claims."],
          },
        ],
      },
      {
        id: "handoff",
        label: "Handoff",
        role: "Produce the prompt, commands, and checks for the next agent.",
        defaultOption: "codex-handoff",
        options: [
          {
            id: "codex-handoff",
            label: "Codex-ready handoff",
            status: "supported",
            tag: "handoff",
            prompt: "Package the workflow as an agent prompt with commands and verification checks.",
            checks: ["Keep private documents and user data out of public handoffs."],
          },
        ],
      },
    ],
```

- [ ] **Step 2: Add smaller rails to other recipes**

Use the same shape for:

- `portfolio-site`: Intent -> Structure -> Copy -> UI Review -> Handoff
- `repo-handoff`: Fetch -> Instructions -> Index -> Plan -> Verify -> Handoff
- `copy-cleanup`: Source -> Meaning Lock -> Rewrite -> UI Context Review -> Handoff
- `FALLBACK`: Goal -> Instructions -> Review -> Handoff

Keep option commands mostly to:

```text
agentsmd gen
agentsmd capabilities show <id>
agentsmd capabilities demo <id>
agentsmd capabilities prompt <id>
agentsmd plan "<goal>"
```

Use `run --yes` only if it already exists in the base route; do not add new `run --yes` rail option commands.

- [ ] **Step 3: Run syntax check**

Run:

```bash
node --check docs/vibe-stack-builder/app.js
```

Expected: exit 0 with no output.

## Task 2: Add Rail Composition Helpers

**Files:**
- Modify: `docs/vibe-stack-builder/app.js`

- [ ] **Step 1: Extend state**

Replace:

```js
const state = { mode: "explore", problem: PROBLEMS[0].id, tool: null, items: [], index: 0 };
```

With:

```js
const state = { mode: "explore", problem: PROBLEMS[0].id, tool: null, items: [], index: 0, stageOptions: {} };
```

- [ ] **Step 2: Add helper functions before `renderRecipe()`**

Add:

```js
function uniqueStrings(items) {
  const seen = new Set();
  return (items || []).filter((item) => {
    const value = String(item || "").trim();
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function stageOption(stage, selectedId) {
  const options = stage.options || [];
  return options.find((o) => o.id === selectedId) || options.find((o) => o.id === stage.defaultOption) || options[0] || null;
}

function selectedStageOptions(route) {
  const saved = state.stageOptions[route.id] || {};
  return (route.stages || []).map((stage) => ({ stage, option: stageOption(stage, saved[stage.id]) })).filter((item) => item.option);
}

function composeRouteOutput(route) {
  const selected = selectedStageOptions(route);
  const stagePrompts = selected.map(({ stage, option }) => option.prompt && `${stage.label}: ${option.prompt}`).filter(Boolean);
  const optionCommands = selected
    .filter(({ option }) => option.status !== "planned")
    .map(({ option }) => option.command)
    .filter(Boolean);
  const optionChecks = selected.flatMap(({ option }) => option.checks || []);
  const prompt = stagePrompts.length ? `${route.prompt || ""}\n\nStage addendum:\n${stagePrompts.map((p) => `- ${p}`).join("\n")}`.trim() : route.prompt || "";
  return {
    workflow: route.workflow || [],
    prompt,
    commands: uniqueStrings([...(route.commands || []), ...optionCommands]),
    checks: uniqueStrings([...(route.checks || []), ...optionChecks]),
    selected,
  };
}

function supportedToolIds() {
  return new Set(Object.keys(TOOLS));
}

function validateRailTools(route) {
  const ids = supportedToolIds();
  return (route.stages || []).flatMap((stage) =>
    (stage.options || [])
      .filter((option) => option.status !== "planned" && option.tool && !ids.has(option.tool))
      .map((option) => `${route.id}/${stage.id}/${option.id} -> ${option.tool}`)
  );
}
```

- [ ] **Step 3: Run syntax check**

Run:

```bash
node --check docs/vibe-stack-builder/app.js
```

Expected: exit 0 with no output.

## Task 3: Render the Workflow Rail

**Files:**
- Modify: `docs/vibe-stack-builder/app.js`

- [ ] **Step 1: Add `renderRail(route, output)` before `renderRecipe()`**

Add:

```js
function renderRail(route, output) {
  if (!route.stages || !route.stages.length) return "";
  const saved = state.stageOptions[route.id] || {};
  const cars = route.stages
    .map((stage, idx) => {
      const selected = stageOption(stage, saved[stage.id]);
      const opts = (stage.options || [])
        .map((option) => {
          const active = selected && option.id === selected.id;
          const planned = option.status === "planned";
          return `<button class="rail-option" type="button" data-stage="${esc(stage.id)}" data-option="${esc(option.id)}" aria-pressed="${active}"><span>${esc(option.label)}</span><small>${esc(option.supportLabel || option.tag || (planned ? "planned" : "supported"))}</small></button>`;
        })
        .join("");
      const inspect =
        selected && selected.tool && TOOLS[selected.tool]
          ? `<button class="rail-inspect" type="button" data-tool="${esc(selected.tool)}">Inspect tool</button>`
          : "";
      return `<div class="rail-car">
        <div class="rail-step">${idx + 1}</div>
        <div class="rail-main">
          <div class="rail-label">${esc(stage.label)}</div>
          <p>${esc(stage.role)}</p>
          <div class="rail-options">${opts}</div>
          ${inspect}
        </div>
      </div>`;
    })
    .join("");
  const invalid = validateRailTools(route);
  const warning = invalid.length ? `<p class="rail-warning">Invalid public tool references: ${esc(invalid.join(", "))}</p>` : "";
  return `<div class="rail">${cars}</div>${warning}`;
}
```

- [ ] **Step 2: Update `renderRecipe(route)` to use composed output**

Inside `renderRecipe`, replace the current `wf/checks/promptText/cmdText` setup and stack block with:

```js
  const output = composeRouteOutput(route);
  const rail = renderRail(route, output);
  const wf = `<ol>${(output.workflow || []).map((w) => `<li>${esc(w)}</li>`).join("")}</ol>`;
  const checks = `<ul>${(output.checks || []).map((c) => `<li>${esc(c)}</li>`).join("")}</ul>`;
  const promptText = output.prompt || "";
  const cmdText = (output.commands || []).join("\n");
```

Then render:

```js
    ${rail ? block("Workflow Rail", rail, false) : `<div class="stack-row">${stack}</div>`}
```

Keep the existing stack chip rendering as fallback.

- [ ] **Step 3: Add event handlers after `r.innerHTML`**

Add before block copy handlers:

```js
  r.querySelectorAll(".rail-option").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.stageOptions[route.id] = Object.assign({}, state.stageOptions[route.id], { [btn.dataset.stage]: btn.dataset.option });
      renderRecipe(route);
    })
  );
  r.querySelectorAll(".rail-inspect").forEach((btn) => btn.addEventListener("click", () => selectTool(btn.dataset.tool)));
```

- [ ] **Step 4: Run syntax check**

Run:

```bash
node --check docs/vibe-stack-builder/app.js
```

Expected: exit 0 with no output.

## Task 4: Style the Rail

**Files:**
- Modify: `docs/vibe-stack-builder/styles.css`

- [ ] **Step 1: Add styles near the existing recipe styles**

Add after `.stack-chip .n`:

```css
.rail { display: grid; gap: var(--s2); }
.rail-car { display: grid; grid-template-columns: 28px 1fr; gap: var(--s3); padding: var(--s3); border: 1px solid var(--line); border-radius: var(--r1); background: var(--panel-2); }
.rail-step { width: 28px; height: 28px; display: grid; place-items: center; border-radius: 50%; border: 1px solid var(--line-strong); color: var(--accent); font-family: var(--font-mono); font-size: 12px; }
.rail-main { min-width: 0; }
.rail-label { font-weight: 700; }
.rail-main p { margin: 2px 0 var(--s2); color: var(--muted); font-size: 12.5px; }
.rail-options { display: flex; flex-wrap: wrap; gap: var(--s2); }
.rail-option, .rail-inspect { border: 1px solid var(--line); border-radius: var(--r1); background: var(--bg); color: var(--muted); padding: 6px 8px; font-size: 12px; }
.rail-option { display: inline-flex; align-items: center; gap: var(--s2); }
.rail-option small { color: var(--quiet); font-family: var(--font-mono); }
.rail-option[aria-pressed="true"] { border-color: var(--accent-2); background: var(--accent-soft); color: var(--text); }
.rail-inspect { margin-top: var(--s2); color: var(--accent); }
.rail-warning { margin: var(--s2) 0 0; color: var(--warn); font-size: 12px; }
```

- [ ] **Step 2: Check mobile layout**

Run a local visual check if available, or inspect CSS to confirm the rail wraps and does not require horizontal scrolling.

## Task 5: Update Docs and Changelog

**Files:**
- Modify: `docs/vibe-stack-builder/DESIGN.md`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Update design status**

In `docs/vibe-stack-builder/DESIGN.md`, change:

```md
- **Recipes** — goal -> assembled workflow + agent prompt + commands + checks. ✅ built
```

To:

```md
- **Recipes / Workflow Rail** — goal -> stage rail -> assembled workflow + agent prompt + commands + checks. ✅ built
```

- [ ] **Step 2: Add changelog entry**

In `CHANGELOG.md` under `## Unreleased`, add:

```md
- Added a public Workflow Rail recipe composer to show stage-based stack assembly without executing tools.
```

## Task 6: Verify and Deploy

**Files:**
- Verify only unless fixes are needed.

- [ ] **Step 1: Run syntax check**

```bash
node --check docs/vibe-stack-builder/app.js
```

Expected: exit 0.

- [ ] **Step 2: Run full tests**

```bash
node --test
```

Expected: all tests pass.

- [ ] **Step 3: Decide Pages deployment**

Because this changes the public demo UI, deploy:

```powershell
Copy-Item -LiteralPath docs\vibe-stack-builder\index.html -Destination tmp\gh-pages-deploy\index.html
Copy-Item -LiteralPath docs\vibe-stack-builder\styles.css -Destination tmp\gh-pages-deploy\styles.css
Copy-Item -LiteralPath docs\vibe-stack-builder\app.js -Destination tmp\gh-pages-deploy\app.js
Copy-Item -LiteralPath docs\vibe-stack-builder\data.js -Destination tmp\gh-pages-deploy\data.js
```

- [ ] **Step 4: Commit main**

```bash
git add docs/vibe-stack-builder/app.js docs/vibe-stack-builder/styles.css docs/vibe-stack-builder/DESIGN.md CHANGELOG.md
git commit -m "Add Workflow Rail recipe composer"
```

- [ ] **Step 5: Commit `gh-pages` deploy worktree**

```bash
cd tmp/gh-pages-deploy
git add index.html styles.css app.js data.js
git commit -m "Deploy Workflow Rail recipe composer"
git push origin gh-pages
```

- [ ] **Step 6: Push main and verify live**

```bash
git push origin main
```

Then verify:

```powershell
Invoke-WebRequest -Uri "https://4dbq9mznvp-ui.github.io/Vibe-Builder-toolkit/?v=<gh-pages-sha>" -UseBasicParsing
```

Expected:

- HTTP 200
- HTML/JS assets load
- Recipes view shows `Workflow Rail`

## Self-Review Checklist

- [ ] No new runtime dependencies.
- [ ] No `data.js` hand edits.
- [ ] No automatic tool execution.
- [ ] No private strategy or proprietary routing/ranking language.
- [ ] Stage option commands are manual, transparent commands.
- [ ] Supported option tools exist in public `TOOLS`.
- [ ] Planned/reference options do not render as supported tools.
- [ ] `node --check docs/vibe-stack-builder/app.js` passes.
- [ ] `node --test` passes.

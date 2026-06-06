# Vibe Stack Builder — Design System

The public web demo for Vibe Builder Toolkit. It should feel like a developer **workbench**, not an
AI-tool directory. Optimize for *speed of judgment* and *speed of assembly*, not landing-page polish.

> Don't collect AI tools. Compose them. — AI 툴을 모으지 말고, 조립하라.

## Principles

1. **Problem-first, not tool-first.** Entry = "무엇을 개선하고 싶나요?", not a grid of tools.
2. **Judgment info over features.** Show when-to-use / when-not / risks / connected tools before any star count.
3. **Launcher feel** (Raycast / Linear / DevDocs): dense, keyboard-first (Cmd/Ctrl-K), panels over decorative cards.
4. **Core actions are Copy and Apply** (copy Codex prompt, copy command, open GitHub) — not "read more".
5. **Honest scope.** Only render real public capability-card data. Planned areas are labeled `준비 중`, never faked.
6. **Public-only.** No accounts, personalization, payment, or proprietary routing logic — those live in the private repo.

## Layout (3-pane workbench)

```text
[ sidebar ]   [ workspace ]        [ inspector ]
 problems       tool list /          selected tool:
 + mode nav     assembled recipe     judgment info + copy/apply
```

- **Left sidebar:** mode nav (Explore / Recipes) + problem categories.
- **Center workspace:** Explore = tool list for the chosen problem; Recipes = goal -> workflow + prompt + commands + checks.
- **Right inspector:** the selected tool's judgment info and copy/apply actions.
- **Top bar:** Cmd/Ctrl-K command palette, repo link, public-demo pill.
- Collapses to a single column under ~900px; the inspector becomes a bottom sheet.

## Design tokens

All visual values live in `styles.css :root`. Edit tokens, never hard-coded values.

- **Theme:** dark console. One accent color; "family" labels are tints of that accent, not a rainbow.
- **Color:** `--bg`, `--panel`, `--panel-2`, `--line`, `--text`, `--muted`, `--accent`, `--accent-soft`, `--warn`.
- **Type:** `--font-sans`, `--font-mono`; sizes `--fs-1..--fs-6`.
- **Space:** 4px scale `--s1..--s6`; radius `--r1`/`--r2`; layout width `--maxw`.

## Data flow (single source of truth)

- `data.js` is **generated** from `/capabilities/*.json` by `build-data.mjs`. **Do not hand-edit `data.js`.**
  - Regenerate: `node docs/vibe-stack-builder/build-data.mjs`
  - Add a capability card -> it appears here automatically.
- Curation that is **not** in cards (problem categories, recipes) lives in `app.js` as marked constants
  (`PROBLEMS`, `RECIPES`). Curation is editorial value; keep it small, concrete, and honest.

## Information architecture (honest status)

- **Explore** — browse real tools by problem, inspect judgment info. ✅ built
- **Recipes** — goal -> assembled workflow + agent prompt + commands + checks. ✅ built
- **Stacks / Prompt Kits / Playground** — planned. Shown as labeled placeholders, never faked. ⏳

## Consistency rules (Claude & Codex)

- Keep it **zero-dependency** vanilla HTML/CSS/JS. The only build step is `build-data.mjs`.
- Use tokens; do not introduce new raw colors or one-off spacing.
- Every tool view must show at least: goal, when-to-use, risks, and one copy action.
- Never present a feature as live unless it is in the shipped UI. Mark future work `준비 중`.
- After web changes run, in order: `node --check docs/vibe-stack-builder/app.js`, `node --test`, then deploy per README
  (edit `docs/vibe-stack-builder/*` on main, copy to `tmp/gh-pages-deploy`, push `gh-pages`, confirm live 200).

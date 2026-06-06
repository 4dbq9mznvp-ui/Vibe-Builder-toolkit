# Capability Card Spec

Last updated: 2026-06-04

## Purpose

Capability cards are the next layer after `agentsmd`.

They translate scattered open-source AI tools into user-goal-centered building abilities:

- what the user wants to do
- which tools can help
- what the trade-offs are
- how to try the capability safely
- how to ask Codex, Claude Code, or Cursor to apply it

The card is not a benchmark, endorsement, or copied wrapper. It is a source-grounded operating note that helps builders move from "starred for later" to "I know how to use this in my project."

## Design Principles

1. Lead with the job, not the tool name.
2. Show a small demo path before asking the user to install anything.
3. Include source URLs and license notes.
4. Include safety and privacy warnings when files, credentials, or third-party code are involved.
5. Generate agent instructions that are concrete enough for Codex/Claude/Cursor.
6. Avoid unverified claims about speed, accuracy, or popularity.
7. Do not vendor or copy third-party code unless the license path is explicit and attribution is preserved.

## Recommended JSON Shape

```json
{
  "id": "pdf-to-markdown",
  "title": "PDF / Office to Markdown",
  "goal": "Turn documents into Markdown that AI agents can read and summarize.",
  "family": "documents",
  "status": "draft",
  "level": 1,
  "primary_tools": [
    {
      "name": "MarkItDown",
      "url": "https://github.com/microsoft/markitdown",
      "license": "MIT",
      "role": "Broad file-to-Markdown conversion for LLM pipelines"
    }
  ],
  "when_to_use": [
    "You need clean Markdown from PDFs, Word, PowerPoint, Excel, HTML, or ZIP files.",
    "You care more about useful text structure than pixel-perfect conversion."
  ],
  "when_not_to_use": [
    "You need reliable table reconstruction from complex scanned PDFs.",
    "You cannot safely process the document on the current machine."
  ],
  "search_terms": [
    "PDF 정리",
    "document cleanup",
    "Office to Markdown"
  ],
  "demo": {
    "type": "fixture",
    "input": "capabilities/pdf-to-markdown/demo/input/sample.pdf",
    "output": "capabilities/pdf-to-markdown/demo/output/sample.md",
    "explanation": "capabilities/pdf-to-markdown/demo/explanation.md",
    "notes": "Fixture demo only; no third-party tool is executed by default."
  },
  "codex_prompt": "Use this project's document conversion capability to turn the supplied file into Markdown, preserve headings/lists/tables where possible, note uncertainty, and do not invent missing content.",
  "verification": [
    "Output is Markdown.",
    "Headings and lists are preserved when present.",
    "Tables are marked for manual review if extraction is uncertain."
  ],
  "risks": [
    "Do not process sensitive documents with tools you have not reviewed.",
    "Check the source tool's security notes before running on untrusted input."
  ],
  "sources": [
    "https://github.com/microsoft/markitdown"
  ]
}
```

## Required Fields

- `id`: stable lowercase slug
- `title`: short display name
- `goal`: user-facing job
- `family`: one of `documents`, `codebase`, `design-copy`, `agent-ops`, `portfolio`
- `status`: `draft`, `tested`, or `deprecated`
- `level`: demo maturity from 0 to 3
- `primary_tools`: source tools with URLs and license notes
- `when_to_use`: decision guide
- `when_not_to_use`: boundaries
- `search_terms`: goal phrases users are likely to remember, including Korean aliases when useful
- `codex_prompt`: ready-to-use instruction
- `verification`: how the user knows the capability worked
- `risks`: privacy, security, license, or accuracy risks
- `sources`: primary source URLs

## Demo Levels

### Level 0: Explanation Card

Static card only. Good for early research.

Requirements:

- source URLs
- license notes
- Codex prompt
- verification checklist
- risk notes

### Level 1: Fixture Demo

Committed input/output sample, no third-party execution.

Requirements:

- small sample input
- expected output
- explanation of what the demo proves and does not prove

### Level 2: Local Runner

Optional command that executes a third-party tool locally.

Requirements:

- explicit user action
- no auto-install
- clear output directory
- security warning
- test coverage for command behavior, not for third-party tool quality
- must follow [Local Runner Safety Model](LOCAL_RUNNER_SAFETY.md)

### Level 3: Interactive Demo

Browser or console UI with drag/drop, graph, before/after view, or preview.

Requirements:

- same safety controls as Level 2
- bounded file size
- visible source attribution
- graceful fallback when the underlying tool is missing

## Initial Card Backlog

### `pdf-to-markdown`

Family: `documents`

Primary references:

- Microsoft MarkItDown

User remembers:

- "PDF cleanup"
- "Office to Markdown"
- "Make portfolio or research documents readable by AI"

### `layout-aware-pdf-parse`

Family: `documents`

Primary references:

- LlamaParse
- LiteParse

User remembers:

- "Extract PDF coordinates and layout"
- "Handle tables and multi-column pages more carefully"
- "Show citation locations"

### `codebase-knowledge-graph`

Family: `codebase`

Primary references:

- Understand Anything

User remembers:

- "Understand a large codebase"
- "Skim a new project as a graph"
- "Ask Codex to explain the whole structure"

### `local-code-index`

Family: `codebase`

Primary references:

- codegraph

User remembers:

- "Explore code with fewer tokens"
- "Expose a code graph through MCP"
- "Check impact radius"

### `ui-taste-review`

Family: `design-copy`

Primary references:

- Taste Skill

User remembers:

- "Make AI UI less generic"
- "Review layout, typography, and spacing"
- "Reduce placeholders and generic slop"

### `ai-writing-humanizer`

Family: `design-copy`

Primary references:

- Stop Slop

User remembers:

- "Clean up AI-ish writing"
- "Remove repetitive cliches"
- "Make portfolio copy sound like a real builder"

## CLI Shape

Future commands should remain simple:

```bash
agentsmd capabilities list
agentsmd capabilities search "PDF 정리"
agentsmd capabilities show pdf-to-markdown
agentsmd capabilities prompt pdf-to-markdown
agentsmd capabilities demo pdf-to-markdown
agentsmd capabilities review ai-writing-humanizer
agentsmd capabilities review ai-writing-humanizer --strict
agentsmd capabilities run ai-writing-humanizer --input draft.md
```

Output should be Markdown-first so it can be pasted into Codex, Claude Code, Cursor, GitHub issues, or docs. Runner handoffs must show the planned argv list, safety flags, and output directory before writing any files. Reviewed first-party adapters may also write local preview outputs such as `output.md` and `changes.md`.

Implemented by v0.5.0:

- `agentsmd capabilities list`
- `agentsmd capabilities search "<goal>"`
- `agentsmd capabilities show <id>`
- `agentsmd capabilities prompt <id>`
- `agentsmd capabilities demo <id>`

Implemented by v0.7.0:

- `agentsmd capabilities run <id> --input <path> [--yes]` preview planning for runner-enabled cards

Implemented by v0.8.0:

- `--yes` writes first-party handoff packages for runner-enabled cards, including `input-manifest.json`, `command.json`, `prompt.md`, `input.md`, `stdout.txt`, `stderr.txt`, and `RUN.md`
- `ai-writing-humanizer` also writes a first-party local cleanup preview as `output.md` and `changes.md`

Implemented after v0.9.0:

- `agentsmd capabilities review <id>` checks handoff readiness and execution metadata gates
- `agentsmd capabilities review <id> --strict` exits non-zero unless every execution gate passes
- `ai-writing-humanizer` passes the strict review gate as the first reviewed adapter metadata candidate, while `capabilities run` still avoids third-party execution

## Acceptance Criteria For First Implementation

- At least 6 cards exist as JSON.
- Every card has source URLs and risk notes.
- Every card has goal-oriented `search_terms`.
- No third-party code is copied or vendored.
- No command auto-installs third-party packages.
- `node --test` passes.
- README links to the strategy/spec docs.

## Non-Goals

- no hosted marketplace yet
- no live scraping/ranking pipeline yet
- no claim that Vibe Builder owns the underlying tools
- no benchmark claims without local reproducible evidence
- no Open Design UI clone

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
  "level": 0,
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
  "demo": {
    "type": "fixture",
    "input": "capabilities/pdf-to-markdown/demo/input/sample.pdf",
    "output": "capabilities/pdf-to-markdown/demo/output/sample.md",
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

- "PDF 정리"
- "Office 자료를 Markdown으로 바꾸기"
- "포트폴리오/리서치 자료를 AI가 읽게 만들기"

### `layout-aware-pdf-parse`

Family: `documents`

Primary references:

- LlamaParse
- LiteParse

User remembers:

- "PDF 좌표/레이아웃까지 뽑기"
- "표와 다단 문서를 덜 망가뜨리기"
- "인용 위치를 표시하기"

### `codebase-knowledge-graph`

Family: `codebase`

Primary references:

- Understand Anything

User remembers:

- "큰 코드베이스 구조 이해"
- "새 프로젝트를 그래프로 훑기"
- "Codex에게 전체 구조를 설명시키기"

### `local-code-index`

Family: `codebase`

Primary references:

- codegraph

User remembers:

- "토큰 아끼며 코드 탐색"
- "MCP로 코드 그래프 제공"
- "영향 범위 확인"

### `ui-taste-review`

Family: `design-copy`

Primary references:

- Taste Skill

User remembers:

- "AI UI가 덜 뻔하게 보이게 하기"
- "레이아웃/타이포/여백 점검"
- "placeholder와 generic slop 줄이기"

### `ai-writing-humanizer`

Family: `design-copy`

Primary references:

- Stop Slop

User remembers:

- "AI 티 나는 글 다듬기"
- "반복 클리셰 제거"
- "포트폴리오 카피를 사람처럼 만들기"

## CLI Shape

Future commands should remain simple:

```bash
agentsmd capabilities list
agentsmd capabilities show pdf-to-markdown
agentsmd capabilities prompt pdf-to-markdown
agentsmd capabilities demo pdf-to-markdown
```

Output should be Markdown-first so it can be pasted into Codex, Claude Code, Cursor, GitHub issues, or docs.

## Acceptance Criteria For First Implementation

- At least 6 cards exist as JSON.
- Every card has source URLs and risk notes.
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

# Vibe Builder Toolkit Product Strategy

Last updated: 2026-06-04

## Executive Summary

Vibe Builder Toolkit should not compete as another AI tool directory, GitHub star list, MCP catalog, or prompt collection. Those products help people discover links, but most builders still stop at: "looks useful, starred it, maybe later."

The competitive position is:

> Turn open-source AI tools into capability cards that builders can understand, try, and wire into Codex-ready workflows in minutes.

The current repo should stay grounded in what exists: `agentsmd` is the first working tool. It generates agent operating documents from one profile and keeps Codex, Claude Code, Cursor, and MCP configuration in sync. The next layer should add capability cards that explain and demonstrate useful open-source tools by user goal, not by tool name.

## Product Goal

Help Korean AI-native solo builders move from scattered English-language developer signals to usable building workflows:

- understand what a tool actually lets them do
- try the capability quickly
- generate Codex/Claude/Cursor instructions for their own project
- keep the work reviewable through specs, checks, build logs, and portfolio outputs

The product is not "find more tools." It is "turn tools into usable building abilities."

## Current Baseline

`agentsmd v0.7.0` is the current execution core.

It already provides:

- `agentsmd.config.json` as the single source of truth
- generation of `AGENTS.md`, `CLAUDE.md`, Cursor rules, and `.mcp.json`
- `gen --ai` for English-optimized `AGENTS.md` generation from a project profile
- recipe-based build plans with `plan`, `run`, `run --verify`, and `status`
- `capabilities list/show/prompt/demo` for source-grounded capability-card discovery, Codex prompt export, and fixture demo previews for every bundled card
- `capabilities run <id> --input <path> [--yes]` for preview-only runner planning with safety flags and predictable output directories
- `docs/LOCAL_RUNNER_SAFETY.md` for the consent, install, execution, and output-path model required before third-party tool execution

This is a credible first slice because it supports the operating context around coding agents before adding broader capability demos.

## Competitive Research

### Open Design

Open Design is a strong reference for the "capability surface" pattern. It positions itself as an open-source alternative to Claude Design and emphasizes skills, design systems, local/BYOK execution, and many CLI adapters. Its public site describes 16 auto-detected CLIs including Claude Code, Codex CLI, Cursor Agent, Gemini CLI, OpenCode, and others, plus a local/BYOK proxy path for OpenAI-compatible endpoints.

Source: https://opendesigner.io/

What to learn:

- skill selection should be concrete and visual
- the product should show the capability, not just list the repository
- local/BYOK language builds trust
- attribution matters when composing from other open-source work

What not to copy:

- do not copy code, UI, copywriting, skill schemas, or bundled assets
- do not position Vibe Builder as a design-agent canvas
- do not chase their breadth before Vibe Builder has one reliable wedge

### Taste Skill

Taste Skill shows that "anti-slop" skill files are becoming a recognizable product category. It frames design quality as a reusable capability for agents like Codex, Claude Code, Cursor, Gemini CLI, v0, and Lovable.

Source: https://www.tasteskill.dev/

What to learn:

- builders understand outcomes like "make UI less generic"
- capability packaging can be lightweight
- a narrow, memorable capability can spread faster than a large platform promise

### MarkItDown

Microsoft MarkItDown is a lightweight Python utility for converting files to Markdown for LLM and text-analysis pipelines. It supports PDFs, Office files, images, audio metadata/transcription, HTML, CSV/JSON/XML, ZIP files, YouTube URLs, EPubs, and more. Its README also warns that conversion runs with the privileges of the current process, so untrusted inputs need care.

Source: https://github.com/microsoft/markitdown

What to learn:

- "document to Markdown for LLMs" is a real builder capability
- Vibe Builder can explain when to use this versus OCR/layout-aware parsers
- capability cards should include security warnings, not just demo buttons

### LiteParse / LlamaParse

LlamaIndex positions LlamaParse as document parsing for complex files and LiteParse as an open-source local parser. Public materials emphasize local parsing, broad document format support, no cloud dependency for LiteParse, and bounding-box output for layout-aware extraction.

Sources:

- https://www.llamaindex.cloud/
- https://developers.api.llamaindex.ai/api/resources/parsing

What to learn:

- "PDF cleanup" splits into multiple capabilities: plain Markdown conversion, OCR, tables, bounding boxes, citations, and layout analysis
- cards should help users choose by job, not by brand

### Understand Anything

Understand Anything turns a codebase, knowledge base, or docs into an interactive knowledge graph. It explicitly supports Claude Code, Codex, Cursor, Copilot, Gemini CLI, and more. Its promise is "stop reading code blind" and use a graph that teaches how pieces fit together.

Source: https://github.com/Lum1104/Understand-Anything

What to learn:

- "codebase understanding" is a high-value agent capability
- the demo should show before/after comprehension, not just a graph screenshot
- Vibe Builder can route users to the right code-understanding option based on repo size and desired output

### codegraph

codegraph is a local-first code-intelligence tool that turns a codebase into a queryable knowledge graph for AI coding agents. Its public site emphasizes Tree-sitter parsing across 20+ languages, MCP exposure to agents, and impact analysis.

Source: https://colbymchenry.github.io/codegraph/

What to learn:

- local-first and MCP-compatible are important buying signals
- "fewer tool calls, better context" is a strong benefit
- Vibe Builder should support agent instructions that tell Codex how to use the selected capability

### OpenAI Codex Programs

OpenAI's Codex for Open Source program supports maintainers of critical open-source software and mentions API credits for PR review, maintainer automation, release workflows, and other OSS work, plus six months of ChatGPT Pro for selected maintainers. The Codex Open Source Fund is a separate API-credit-oriented initiative for open-source projects using Codex CLI and OpenAI models.

Sources:

- https://openai.com/form/codex-for-oss/
- https://openai.com/form/codex-open-source-fund/

Implication:

Vibe Builder should present itself as open-source infrastructure for Codex-assisted maintainers and builders, not as a vague AI directory. Stronger evidence will require usage examples, real workflows, tests, releases, and contribution docs.

## Positioning

### One-liner

Vibe Builder Toolkit turns useful open-source AI tools into capability cards, runnable demos, and Codex-ready workflows for AI-native builders.

### Korean one-liner

바이브빌더 툴킷은 흩어진 오픈소스 AI 도구를 10초 체험 가능한 능력 카드와 Codex 작업 흐름으로 바꿔주는 빌더 운영 툴킷이다.

### Category

Open-source AI capability layer for builders.

### First wedge

Agent operating documents and build conductors through `agentsmd`.

### Second wedge

Capability cards for common builder jobs:

- PDF / Office cleanup
- codebase understanding
- AI writing review
- UI taste review
- feature spec generation
- build log and portfolio generation

## What To Cut

Cut or defer these from the near-term repo story:

- full AI app store language
- ranking engine claims
- community platform claims
- paid course/workshop platform language
- broad "OS" claims that imply the platform already exists
- copied Open Design-style UI/copy/code
- automatic invocation of agents before the safety and control model is designed
- scraped community data pipelines before source permissions and rate limits are clear

These can remain as future possibilities, but not as current product claims.

## What To Keep

Keep these as the core:

- `agentsmd` as the first working tool
- single source of truth for agent instructions
- Korean profile -> English agent-ready output
- explicit verification loops
- open-source templates and examples
- capability-card direction, framed as the next layer
- attribution-safe use of third-party open-source tools

## Feature Model

### Capability Card

Each card should be written around the user goal, not the tool name.

Recommended fields:

- `id`: stable slug, e.g. `pdf-to-markdown`
- `goal`: user-facing job, e.g. "Turn PDFs and Office files into Markdown"
- `when_to_use`: short decision guidance
- `tools`: referenced open-source projects with URLs, licenses, and install notes
- `demo`: one small input, expected output, and runtime expectation
- `codex_prompt`: ready-to-copy instruction for Codex
- `verification`: command or manual check
- `risks`: privacy, license, input-safety, accuracy, or hallucination warnings
- `next_actions`: how to wire the tool into a real project

### Capability Families

Start with five families:

1. Documents: PDF, Office, OCR, layout extraction, Markdown cleanup
2. Codebase: graphing, indexing, impact analysis, architecture summaries
3. Design and copy: UI taste, AI writing review, brand voice, portfolio copy
4. Agent operations: AGENTS.md, CLAUDE.md, MCP, recipes, review loops
5. Portfolio: build logs, case studies, README upgrades, release notes

### Demo Levels

Avoid trying to run every third-party tool on day one.

- Level 0: static card with source-grounded explanation and safe install notes
- Level 1: recorded or fixture-based demo using committed sample input/output
- Level 2: local runner command that executes the tool in a sandboxed project folder
- Level 3: browser UI with drag/drop or interactive graph preview

Early capability releases should target Level 0 and Level 1. Level 2 should be added only for tools with clear licenses, safe install paths, and predictable runtime.

## Implementation Plan

### Phase 1: Product planning docs

Goal: make the repo's direction clear without overclaiming.

Deliverables:

- `docs/PRODUCT_STRATEGY.md`
- `docs/CAPABILITY_CARD_SPEC.md`
- README link to the strategy docs

Acceptance checks:

- README still describes the current `agentsmd` tool accurately
- future capability cards are described as next direction, not shipped reality
- third-party inspiration is attributed and not copied

### Phase 2: Static capability registry

Goal: create the first useful capability layer without building a platform.

Deliverables:

- `capabilities/*.json`
- `capabilities/README.md`
- 6 initial cards:
  - `pdf-to-markdown`
  - `layout-aware-pdf-parse`
  - `codebase-knowledge-graph`
  - `local-code-index`
  - `ui-taste-review`
  - `ai-writing-humanizer`

Implementation notes:

- keep JSON schema simple and hand-editable
- include source URLs and license fields
- include "not tested locally yet" where true
- do not vendor third-party code

Acceptance checks:

- every card has a user goal, tool references, safety notes, and Codex prompt
- no card claims a benchmark unless verified in this repo
- links are source-grounded

Status: implemented in v0.3.0. All six bundled cards have Level 1 fixture demos as of v0.5.0.

### Phase 3: CLI support for capability cards

Goal: let `agentsmd` display and export capability cards.

Candidate commands:

```bash
agentsmd capabilities list
agentsmd capabilities show pdf-to-markdown
agentsmd capabilities prompt pdf-to-markdown
agentsmd capabilities plan pdf-to-markdown
```

Implementation notes:

- reuse zero-dependency Node style
- parse local JSON files
- avoid installing or executing third-party tools in this phase
- generate Markdown output suitable for Codex/Claude/Cursor

Acceptance checks:

- `node --test` passes
- command help documents the new commands
- invalid capability IDs fail with a useful message

Status: `list`, `show`, `prompt`, and `demo` are implemented by v0.5.0. `plan` is still deferred.

### Phase 4: Fixture-based demos

Goal: move from "card" to "10-second demo" without unsafe tool execution.

Deliverables:

- `capabilities/<id>/demo/input/*`
- `capabilities/<id>/demo/output/*`
- `agentsmd capabilities demo <id>` to print the demo path and expected output

Implementation notes:

- use tiny committed fixtures
- include privacy warnings for user-provided documents
- make each demo educational even when the tool is not installed

Acceptance checks:

- every demo has source input, expected output, and explanation
- no external network call is required
- the demo can be reviewed in GitHub

Status: implemented for all six bundled cards in v0.5.0.

### Phase 5: Optional local runners

Goal: add real execution only where safe and useful.

Deliverables:

- per-card runner docs
- optional scripts for trusted local execution
- explicit user confirmation before running third-party install commands

Implementation notes:

- never auto-install third-party packages
- never run untrusted document conversion without warning
- keep all generated output in a disposable folder

Acceptance checks:

- runner is opt-in
- security warning is visible
- output path is predictable and gitignored if large

Status: safety model documented in v0.6.0; preview-only runner planning implemented in v0.7.0 for `ai-writing-humanizer`. No third-party runner executes yet.

## Open-Core Boundary

Open-source core:

- `agentsmd`
- capability card schema
- initial card registry
- fixture demos
- templates for AGENTS.md, feature specs, reviews, build logs
- examples based on the maintainer's own projects

Potential closed or hosted layer later:

- personalized dashboard
- saved user projects
- hosted demo execution
- curated Korean market reports
- paid workshops or playbooks
- community analytics

Do not introduce closed-platform language until the open-source core is useful on its own.

## Risks And Controls

### Risk: Too broad too early

Control: keep `agentsmd` as the current product and add capability cards as static registry first.

### Risk: Looks like a clone of Open Design

Control: use original information architecture around builder goals, not design canvases. Do not copy UI, text, code, schemas, or assets.

### Risk: Link directory with nicer labels

Control: every card must include a Codex prompt, verification step, and demo path.

### Risk: Unsafe third-party execution

Control: no auto-install or auto-run in the first capability phases. Add explicit runner warnings later.

### Risk: Weak OSS support-program fit

Control: build visible maintainer workflows: tests, CI, release notes, issue templates, contribution docs, and examples of Codex-assisted review/triage.

## Near-Term Decision

The next implementation step should add the first reviewed runner adapter without weakening the v0.7 guardrails:

1. Keep `ai-writing-humanizer` as the first low-risk candidate.
2. Add an adapter behind the existing preview plan, not a new hidden execution path.
3. Keep `--yes` consent, argv rendering, and `.agentsmd/runs/<capability-id>/<timestamp>/` output planning mandatory.
4. Continue disabling third-party execution for every card until its adapter has source, install, input, output, and test coverage.

This keeps the project competitive without pretending the full AI Capability OS already exists.

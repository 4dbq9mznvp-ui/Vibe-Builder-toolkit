# Capability Cards

Capability cards describe useful AI-builder abilities by user goal, not by tool name.

They are the next layer after `agentsmd`:

1. explain what the builder wants to do
2. point to source-grounded open-source tools
3. provide a Codex-ready prompt
4. include verification and risk notes
5. avoid copying or vendoring third-party code

See [Capability Card Spec](../docs/CAPABILITY_CARD_SPEC.md).

Search by goal instead of tool name:

```bash
agentsmd capabilities search "PDF 정리"
agentsmd capabilities search "코드 이해"
agentsmd capabilities search "AI 글 인간화"
```

## Current Cards

| Card | Family | Level | Purpose |
|---|---|---:|---|
| [`pdf-to-markdown`](pdf-to-markdown.json) | documents | 1 | Convert PDFs and Office files into Markdown for AI workflows. |
| [`layout-aware-pdf-parse`](layout-aware-pdf-parse.json) | documents | 1 | Extract document structure with layout and bounding-box awareness. |
| [`codebase-knowledge-graph`](codebase-knowledge-graph.json) | codebase | 1 | Explore large projects through an interactive knowledge graph. |
| [`local-code-index`](local-code-index.json) | codebase | 1 | Build a local queryable code graph for agent context and impact analysis. |
| [`ui-taste-review`](ui-taste-review.json) | design-copy | 1 | Reduce generic AI UI output with taste and craft checks. |
| [`ai-writing-humanizer`](ai-writing-humanizer.json) | design-copy | 1 | Remove AI-ish writing patterns from copy and portfolio text. Includes a first-party runner handoff. |

All bundled cards are Level 1: each has committed fixture input, expected output, and explanation files. No card executes third-party tools yet. Runner handoffs may write command plans, prompts, manifests, and run summaries, but third-party execution remains disabled.

Use `agentsmd capabilities review <id>` to inspect whether a runner is safe for handoff use and whether its execution metadata passes the review gate. `ai-writing-humanizer` is the first reviewed adapter metadata candidate; `agentsmd capabilities review ai-writing-humanizer --strict` passes, while `capabilities run` still writes a first-party handoff package only.

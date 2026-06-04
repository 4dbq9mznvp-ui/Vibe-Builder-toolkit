This demo shows why layout-aware parsing is different from simple Markdown conversion:

- each block keeps page context
- each block can include bounding-box coordinates
- multi-column reading order is explicit
- tables can be flagged for manual review
- output can support citation, compliance, or RAG workflows

No LlamaParse or LiteParse call runs in this fixture. A real runner must handle consent, privacy, pricing, and file-size controls before sending or parsing user documents.

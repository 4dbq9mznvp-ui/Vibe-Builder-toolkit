# Codebase Knowledge Graph Demo

## Observed Nodes

- `src/cli.js`: command router
- `src/commands/capabilities.js`: capabilities subcommand handler
- `src/lib/capabilities.js`: card loading and Markdown renderers
- `capabilities/*.json`: source card data
- `test/capabilities.test.js`: unit coverage for loading and rendering behavior

## Relationships

- `src/cli.js` imports `cmdCapabilities`.
- `cmdCapabilities` calls renderers from `src/lib/capabilities.js`.
- `src/lib/capabilities.js` reads bundled card JSON from `capabilities/`.
- `test/capabilities.test.js` verifies the card loader and rendered outputs.

## Suggested Edit Plan

1. Add a `renderCapabilityDemo(card)` function in `src/lib/capabilities.js`.
2. Add a `demo` subcommand in `src/commands/capabilities.js`.
3. Add fixture paths to the relevant card JSON files.
4. Add tests that fixture-backed cards have committed input/output/explanation files.
5. Run `node --test`.

## Review Notes

- This fixture is a graph-style summary, not an output from Understand Anything.
- The graph should guide inspection; it should not replace reading code before edits.

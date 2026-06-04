# Impact Query Result

## Query

What files are likely affected if we change the capability card JSON schema to require `demo.explanation`?

## Likely Affected Files

1. `src/lib/capabilities.js`
   - `validateCapability()` should validate fixture demo fields.
   - `renderCapabilityDemo()` reads `demo.explanation`.

2. `capabilities/*.json`
   - Every Level 1 card needs `demo.input`, `demo.output`, and `demo.explanation`.

3. `test/capabilities.test.js`
   - Add or update tests that fixture files exist for Level 1 cards.

4. `docs/CAPABILITY_CARD_SPEC.md`
   - Keep the schema documentation aligned with implementation.

## Suggested Verification

```bash
node --test test/capabilities.test.js
node --test
```

## Caveat

This fixture shows the shape of a local index answer. It is not the output of codegraph or another static analysis engine.

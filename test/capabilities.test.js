import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  getCapability,
  loadCapabilities,
  renderCapabilityList,
  renderCapabilityPrompt,
  renderCapabilityShow,
} from '../src/lib/capabilities.js';

test('package includes capability cards in published files', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.ok(pkg.files.includes('capabilities'));
});

test('loadCapabilities reads bundled cards in stable order', () => {
  const cards = loadCapabilities();
  assert.ok(cards.length >= 6, 'has initial capability cards');
  assert.deepEqual(
    cards.map((c) => c.id),
    [...cards.map((c) => c.id)].sort(),
    'sorted by id'
  );
  assert.ok(cards.some((c) => c.id === 'pdf-to-markdown'));
});

test('getCapability returns a card or a useful error', () => {
  const card = getCapability('pdf-to-markdown');
  assert.equal(card.title, 'PDF / Office to Markdown');

  assert.throws(
    () => getCapability('missing-card'),
    /Capability not found: missing-card.*Available:/s
  );
});

test('renderCapabilityList shows id, family, level, and goal', () => {
  const out = renderCapabilityList(loadCapabilities());
  assert.match(out, /pdf-to-markdown/);
  assert.match(out, /documents/);
  assert.match(out, /L0/);
  assert.match(out, /Turn PDFs/);
});

test('renderCapabilityShow emits source-grounded markdown', () => {
  const out = renderCapabilityShow(getCapability('pdf-to-markdown'));
  assert.match(out, /^# PDF \/ Office to Markdown/m);
  assert.match(out, /## Tools/);
  assert.match(out, /MarkItDown/);
  assert.match(out, /## Codex Prompt/);
  assert.match(out, /## Risks/);
});

test('renderCapabilityPrompt returns only the prompt text', () => {
  const card = getCapability('pdf-to-markdown');
  const out = renderCapabilityPrompt(card);
  assert.equal(out.trim(), card.codex_prompt);
});

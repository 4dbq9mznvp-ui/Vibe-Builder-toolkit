import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import {
  getCapability,
  loadCapabilities,
  renderCapabilityDemo,
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
  assert.match(out, /L1/);
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

test('fixture demos are discoverable for promoted cards', () => {
  const card = getCapability('pdf-to-markdown');
  assert.equal(card.level, 1);
  assert.equal(card.demo.type, 'fixture');
  assert.ok(card.demo.input);
  assert.ok(card.demo.output);
  assert.ok(card.demo.explanation);
});

test('every bundled card is level 1 and has committed fixture files', () => {
  const root = new URL('../', import.meta.url);
  const cards = loadCapabilities();
  assert.ok(cards.length >= 6, 'has bundled cards');
  for (const card of cards) {
    assert.equal(card.level, 1, `${card.id}: level`);
    assert.equal(card.demo.type, 'fixture', `${card.id}: fixture demo`);
    for (const field of ['input', 'output', 'explanation']) {
      assert.ok(existsSync(new URL(card.demo[field], root)), `${card.id}: ${field} exists`);
    }
  }
});

test('renderCapabilityDemo emits fixture paths and preview text', () => {
  const out = renderCapabilityDemo(getCapability('ai-writing-humanizer'));
  assert.match(out, /^# Demo: AI Writing Humanizer/m);
  assert.match(out, /## Input/);
  assert.match(out, /capabilities\/ai-writing-humanizer\/demo\/input\/sample.md/);
  assert.match(out, /## Expected Output/);
  assert.match(out, /## Explanation/);
  assert.match(out, /No third-party tool is executed/);
});

test('renderCapabilityDemo emits local code index fixture details', () => {
  const out = renderCapabilityDemo(getCapability('local-code-index'));
  assert.match(out, /^# Demo: Local Code Index/m);
  assert.match(out, /capabilities\/local-code-index\/demo\/input\/sample-query.txt/);
  assert.match(out, /Impact Query Result/);
});

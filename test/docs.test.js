import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('README links to the local runner safety model', () => {
  const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
  assert.match(readme, /LOCAL_RUNNER_SAFETY\.md/);
});

test('README links to the Codex OSS support brief', () => {
  const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
  assert.match(readme, /CODEX_OSS_SUPPORT_BRIEF\.md/);
});

test('local runner safety model captures required controls', () => {
  const doc = readFileSync(new URL('../docs/LOCAL_RUNNER_SAFETY.md', import.meta.url), 'utf8');
  for (const phrase of [
    'No auto-install',
    'No shell by default',
    'Explicit consent',
    'Predictable output directory',
    'No untrusted input by default',
    'Runner readiness checklist',
  ]) {
    assert.match(doc, new RegExp(phrase));
  }
});

test('Codex OSS support brief is source-grounded and honest about fit', () => {
  const doc = readFileSync(new URL('../docs/CODEX_OSS_SUPPORT_BRIEF.md', import.meta.url), 'utf8');
  for (const phrase of [
    'Codex for Open Source',
    'Codex open source fund',
    'pull request review',
    'issue triage',
    'release workflows',
    'API credits',
    'ChatGPT Pro',
    'OpenAI Organization ID',
    'Open Source Fund is the stronger near-term fit',
    'Codex for Open Source becomes stronger after adoption signals grow',
  ]) {
    assert.match(doc, new RegExp(phrase));
  }
});

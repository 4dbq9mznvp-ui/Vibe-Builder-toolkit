import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('README links to the local runner safety model', () => {
  const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
  assert.match(readme, /LOCAL_RUNNER_SAFETY\.md/);
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

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('README links to the local runner safety model', () => {
  const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
  assert.match(readme, /LOCAL_RUNNER_SAFETY\.md/);
});

test('README links to the Codex OSS support brief', () => {
  const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
  assert.match(readme, /CODEX_OSS_SUPPORT_BRIEF\.md/);
});

test('README links to contributor and release docs', () => {
  const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
  assert.match(readme, /CONTRIBUTING\.md/);
  assert.match(readme, /CHANGELOG\.md/);
  assert.match(readme, /MAINTAINER_WORKFLOW\.md/);
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

test('repository has contributor onboarding and release history docs', () => {
  const contributing = readFileSync(new URL('../CONTRIBUTING.md', import.meta.url), 'utf8');
  assert.match(contributing, /node --test/);
  assert.match(contributing, /agentsmd gen/);
  assert.match(contributing, /capability cards/);
  assert.match(contributing, /third-party execution/);

  const changelog = readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8');
  for (const version of ['0.8.0', '0.7.0', '0.6.0', '0.5.0', '0.3.0']) {
    assert.match(changelog, new RegExp(`## ${version}`));
  }
});

test('repository has GitHub issue templates for maintainer workflows', () => {
  const root = new URL('../', import.meta.url);
  for (const file of [
    '.github/ISSUE_TEMPLATE/bug_report.yml',
    '.github/ISSUE_TEMPLATE/capability_card.yml',
    '.github/ISSUE_TEMPLATE/runner_safety_review.yml',
    '.github/workflows/test.yml',
  ]) {
    assert.ok(existsSync(new URL(file, root)), `${file} exists`);
  }

  const runner = readFileSync(new URL('../.github/ISSUE_TEMPLATE/runner_safety_review.yml', import.meta.url), 'utf8');
  assert.match(runner, /No auto-install/);
  assert.match(runner, /Explicit consent/);
  assert.match(runner, /Predictable output directory/);
});

test('repository documents a Codex maintainer workflow', () => {
  const workflow = readFileSync(new URL('../docs/MAINTAINER_WORKFLOW.md', import.meta.url), 'utf8');
  for (const phrase of [
    'issue triage',
    'pull request review',
    'release note',
    'API credits',
    'agentsmd plan',
    'agentsmd run --verify',
    'capabilities run ai-writing-humanizer',
    'No third-party tool is executed',
    'Codex handoff package',
  ]) {
    assert.match(workflow, new RegExp(phrase));
  }

  const support = readFileSync(new URL('../docs/CODEX_OSS_SUPPORT_BRIEF.md', import.meta.url), 'utf8');
  assert.match(support, /documented Codex maintainer workflow/);
  assert.doesNotMatch(support, /Evidence still needed:\n\n- tagged release\n- example maintainership workflow/s);
});

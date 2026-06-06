import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('README links to the local runner safety model', () => {
  const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
  assert.match(readme, /LOCAL_RUNNER_SAFETY\.md/);
});

test('README links to the public boundary and external workflow', () => {
  const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
  assert.match(readme, /OPEN_CORE_BOUNDARY\.md/);
  assert.match(readme, /EXTERNAL_WORKFLOW\.md/);
  assert.match(readme, /4dbq9mznvp-ui\.github\.io\/Vibe-Builder-toolkit\//);
  assert.doesNotMatch(readme, /PRODUCT_STRATEGY\.md/);
  assert.doesNotMatch(readme, /CODEX_OSS_APPLICATION_DRAFT\.md/);
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
  assert.match(readme, /RELEASE_CHECKLIST\.md/);
});

test('release version is synchronized across package, CLI, changelog, and README', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const cli = readFileSync(new URL('../src/cli.js', import.meta.url), 'utf8');
  const changelog = readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8');
  const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');

  assert.equal(pkg.version, '0.9.0');
  assert.match(cli, /const VERSION = '0\.9\.0'/);
  assert.match(changelog, /## 0\.9\.0/);
  assert.match(readme, /\*\*v0\.9\.0 \(current\)\*\*/);
});

test('local runner safety model captures required controls', () => {
  const doc = readFileSync(new URL('../docs/LOCAL_RUNNER_SAFETY.md', import.meta.url), 'utf8');
  for (const phrase of [
    'No auto-install',
    'No shell by default',
    'Explicit consent',
    'Predictable output directory',
    'No untrusted input by default',
    'agentsmd capabilities review <id>',
    'agentsmd capabilities review <id> --strict',
    'reviewed-execution-adapter',
    'Passing the review gate is necessary, but not sufficient, for runtime execution',
    'Runtime execution is implemented separately from the handoff path',
    'output.md',
    'changes.md',
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

test('open-core boundary separates public and private material', () => {
  const boundary = readFileSync(new URL('../docs/OPEN_CORE_BOUNDARY.md', import.meta.url), 'utf8');
  for (const phrase of [
    'Public Core',
    'Private Layer',
    'private/PRODUCT_STRATEGY.md',
    'private/CODEX_OSS_APPLICATION_DRAFT.md',
    'Separate Private Repo',
    'Pre-Publish Check',
    'git ls-files private .private .agentsmd .env .env.local tmp',
  ]) {
    assert.ok(boundary.includes(phrase), phrase);
  }
  assert.equal(existsSync(new URL('../docs/PRODUCT_STRATEGY.md', import.meta.url)), false);
  assert.equal(existsSync(new URL('../docs/CODEX_OSS_APPLICATION_DRAFT.md', import.meta.url)), false);
});

test('external workflow keeps agent handoffs repeatable outside this repo', () => {
  const workflow = readFileSync(new URL('../docs/EXTERNAL_WORKFLOW.md', import.meta.url), 'utf8');
  for (const phrase of [
    'profile -> generated agent instructions -> plan -> agent handoff -> verification -> status/release note',
    'npx agentsmd init',
    'npx agentsmd gen',
    'agentsmd plan "<goal>"',
    'agentsmd run --verify',
    'agentsmd capabilities search "<goal>"',
    '.agentsmd/runs/<capability-id>/<timestamp>/',
    '.mcp.json',
  ]) {
    assert.ok(workflow.includes(phrase), phrase);
  }
});

test('repository includes GitHub Pages demo source for Vibe Stack Builder', () => {
  const root = new URL('../', import.meta.url);
  for (const file of [
    'docs/vibe-stack-builder/index.html',
    'docs/vibe-stack-builder/styles.css',
    'docs/vibe-stack-builder/app.js',
  ]) {
    assert.ok(existsSync(new URL(file, root)), `${file} exists`);
  }

  const html = readFileSync(new URL('../docs/vibe-stack-builder/index.html', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../docs/vibe-stack-builder/app.js', import.meta.url), 'utf8');
  assert.match(html, /Vibe Stack Builder/);
  assert.match(html, /styles\.css/);
  assert.match(html, /app\.js/);
  assert.match(app, /document-content/);
  assert.match(app, /repo-handoff/);
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

test('repository has a release checklist for tagged releases', () => {
  const checklist = readFileSync(new URL('../docs/RELEASE_CHECKLIST.md', import.meta.url), 'utf8');
  for (const phrase of [
    'v0.9.0',
    'node --test',
    'git tag',
    'git push origin main',
    'git push origin v0.9.0',
    'CHANGELOG.md',
    'package.json',
  ]) {
    assert.match(checklist, new RegExp(phrase));
  }
});

test('Codex OSS support brief records the v0.9.0 tagged release evidence', () => {
  const support = readFileSync(new URL('../docs/CODEX_OSS_SUPPORT_BRIEF.md', import.meta.url), 'utf8');
  assert.match(support, /tagged v0\.9\.0 release/);
  assert.doesNotMatch(support, /Evidence still needed:\n\n- tagged release/);
});

test('repository includes a concrete maintainer workflow example', () => {
  const root = new URL('../', import.meta.url);
  for (const file of [
    'examples/maintainer-workflow/README.md',
    'examples/maintainer-workflow/issue.md',
    'examples/maintainer-workflow/triage-note.md',
    'examples/maintainer-workflow/codex-handoff.md',
    'examples/maintainer-workflow/pr-review.md',
    'examples/maintainer-workflow/release-note.md',
  ]) {
    assert.ok(existsSync(new URL(file, root)), `${file} exists`);
  }

  const example = readFileSync(new URL('../examples/maintainer-workflow/README.md', import.meta.url), 'utf8');
  for (const phrase of [
    'issue triage',
    'Codex handoff',
    'pull request review',
    'release note',
    'node --test',
    'agentsmd run --verify',
    'No third-party tool is executed',
  ]) {
    assert.match(example, new RegExp(phrase));
  }

  const support = readFileSync(new URL('../docs/CODEX_OSS_SUPPORT_BRIEF.md', import.meta.url), 'utf8');
  assert.match(support, /sample maintainer workflow walkthrough/);
});

test('repository includes publish-ready v0.9.0 release notes', () => {
  const release = readFileSync(new URL('../docs/releases/v0.9.0.md', import.meta.url), 'utf8');
  for (const phrase of [
    'v0.9.0 - Maintainer readiness release',
    'Codex maintainer workflow',
    'sample maintainer workflow walkthrough',
    'first-party Codex handoff packages',
    'Third-party execution remains disabled',
    'node --test',
    'Full Changelog',
  ]) {
    assert.match(release, new RegExp(phrase));
  }

  const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
  assert.match(readme, /docs\/releases\/v0\.9\.0\.md/);

  const support = readFileSync(new URL('../docs/CODEX_OSS_SUPPORT_BRIEF.md', import.meta.url), 'utf8');
  assert.match(support, /publish-ready v0\.9\.0 release notes/);
});

test('public support docs do not depend on private application drafts', () => {
  const support = readFileSync(new URL('../docs/CODEX_OSS_SUPPORT_BRIEF.md', import.meta.url), 'utf8');
  assert.doesNotMatch(support, /CODEX_OSS_APPLICATION_DRAFT\.md/);
  assert.match(support, /private workspace/);
});

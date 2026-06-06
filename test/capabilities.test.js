import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  getCapability,
  loadCapabilities,
  planCapabilityRun,
  renderCapabilitySearch,
  renderCapabilityRunnerReview,
  renderCapabilityDemo,
  renderCapabilityList,
  renderCapabilityPrompt,
  renderCapabilityRunPlan,
  renderCapabilityShow,
  reviewCapabilityRunner,
  searchCapabilities,
  writeCapabilityRunHandoff,
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

test('searchCapabilities finds cards by user goals and Korean search terms', () => {
  const cards = loadCapabilities();

  assert.equal(searchCapabilities(cards, 'PDF 정리')[0].id, 'pdf-to-markdown');
  assert.equal(searchCapabilities(cards, '코드 이해')[0].id, 'codebase-knowledge-graph');
  assert.equal(searchCapabilities(cards, 'AI 글 인간화')[0].id, 'ai-writing-humanizer');
  assert.equal(searchCapabilities(cards, 'AI UI')[0].id, 'ui-taste-review');
  assert.ok(!searchCapabilities(cards, 'AI 글 인간화').some((card) => card.id === 'pdf-to-markdown'));
  assert.ok(!searchCapabilities(cards, 'AI UI').some((card) => card.id === 'pdf-to-markdown'));
});

test('renderCapabilitySearch shows ranked cards and useful next commands', () => {
  const results = searchCapabilities(loadCapabilities(), '디자인 개선');
  const out = renderCapabilitySearch('디자인 개선', results);

  assert.match(out, /^# Capability Search/m);
  assert.match(out, /Query: `디자인 개선`/);
  assert.match(out, /ui-taste-review/);
  assert.match(out, /agentsmd capabilities demo ui-taste-review/);
  assert.match(out, /agentsmd capabilities prompt ui-taste-review/);
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

test('every bundled card has goal-oriented search terms', () => {
  for (const card of loadCapabilities()) {
    assert.ok(Array.isArray(card.search_terms), `${card.id}: search_terms must be an array`);
    assert.ok(card.search_terms.length >= 3, `${card.id}: has useful search aliases`);
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

test('planCapabilityRun creates a reviewed adapter handoff plan with a predictable output path', () => {
  const card = getCapability('ai-writing-humanizer');
  const plan = planCapabilityRun(card, {
    inputPath: 'capabilities/ai-writing-humanizer/demo/input/sample.md',
    now: new Date('2026-06-04T00:00:00.000Z'),
    consent: false,
  });

  assert.equal(plan.capabilityId, 'ai-writing-humanizer');
  assert.equal(plan.status, 'reviewed-execution-adapter');
  assert.equal(plan.inputPath, 'capabilities/ai-writing-humanizer/demo/input/sample.md');
  assert.equal(plan.outputDir, '.agentsmd/runs/ai-writing-humanizer/2026-06-04T00-00-00-000Z/');
  assert.deepEqual(plan.command, ['agentsmd', 'capabilities', 'prompt', 'ai-writing-humanizer']);
  assert.equal(plan.willExecute, false);
});

test('renderCapabilityRunPlan refuses execution without explicit consent', () => {
  const plan = planCapabilityRun(getCapability('ai-writing-humanizer'), {
    inputPath: 'draft.md',
    now: new Date('2026-06-04T00:00:00.000Z'),
    consent: false,
  });
  const out = renderCapabilityRunPlan(plan);

  assert.match(out, /^# Runner Preview: AI Writing Humanizer/m);
  assert.match(out, /No third-party tool will be executed/);
  assert.match(out, /Use `agentsmd capabilities run ai-writing-humanizer --input draft.md --yes`/);
  assert.match(out, /\.agentsmd\/runs\/ai-writing-humanizer\/2026-06-04T00-00-00-000Z\//);
});

test('renderCapabilityRunPlan keeps execution disabled even with consent', () => {
  const plan = planCapabilityRun(getCapability('ai-writing-humanizer'), {
    inputPath: 'draft.md',
    now: new Date('2026-06-04T00:00:00.000Z'),
    consent: true,
  });
  const out = renderCapabilityRunPlan(plan);

  assert.equal(plan.willExecute, false);
  assert.match(out, /Explicit consent received/);
  assert.match(out, /First-party handoff files can be written/);
  assert.match(out, /Actual third-party execution is disabled in this version/);
  assert.doesNotMatch(out, /must add a reviewed runner adapter/);
});

test('planCapabilityRun errors when no local runner is configured', () => {
  assert.throws(
    () => planCapabilityRun(getCapability('pdf-to-markdown'), { inputPath: 'sample.pdf' }),
    /No local runner is configured for pdf-to-markdown/
  );
});

test('writeCapabilityRunHandoff requires explicit consent', () => {
  const plan = planCapabilityRun(getCapability('ai-writing-humanizer'), {
    inputPath: 'draft.md',
    now: new Date('2026-06-04T00:00:00.000Z'),
    consent: false,
  });

  assert.throws(
    () => writeCapabilityRunHandoff(getCapability('ai-writing-humanizer'), plan),
    /Refusing to write runner handoff without --yes/
  );
});

test('writeCapabilityRunHandoff creates a reviewed first-party handoff package', () => {
  const dir = mkdtempSync(join(tmpdir(), 'agentsmd-run-'));
  try {
    writeFileSync(join(dir, 'draft.md'), '# Draft\n\nThis copy is really transformative and seamless.');
    const card = getCapability('ai-writing-humanizer');
    const plan = planCapabilityRun(card, {
      inputPath: 'draft.md',
      now: new Date('2026-06-04T00:00:00.000Z'),
      consent: true,
    });

    const result = writeCapabilityRunHandoff(card, plan, { cwd: dir });
    const runDir = join(dir, '.agentsmd', 'runs', 'ai-writing-humanizer', '2026-06-04T00-00-00-000Z');

    assert.equal(result.executedThirdParty, false);
    assert.equal(result.outputDir, runDir);
    for (const file of [
      'input-manifest.json',
      'command.json',
      'prompt.md',
      'input.md',
      'stdout.txt',
      'stderr.txt',
      'RUN.md',
    ]) {
      assert.ok(existsSync(join(runDir, file)), `${file} exists`);
    }

    const command = JSON.parse(readFileSync(join(runDir, 'command.json'), 'utf8'));
    assert.deepEqual(command.argv, ['agentsmd', 'capabilities', 'prompt', 'ai-writing-humanizer']);
    assert.equal(command.runner_status, 'reviewed-execution-adapter');
    assert.equal(command.executed_third_party, false);

    const manifest = JSON.parse(readFileSync(join(runDir, 'input-manifest.json'), 'utf8'));
    assert.equal(manifest.capability_id, 'ai-writing-humanizer');
    assert.equal(manifest.input_path, 'draft.md');
    assert.equal(manifest.input_bytes, 57);
    assert.match(manifest.input_sha256, /^[a-f0-9]{64}$/);

    assert.equal(readFileSync(join(runDir, 'prompt.md'), 'utf8').trim(), card.codex_prompt);
    assert.match(readFileSync(join(runDir, 'RUN.md'), 'utf8'), /Third-party execution: disabled/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('reviewCapabilityRunner marks ai-writing-humanizer adapter metadata ready', () => {
  const review = reviewCapabilityRunner(getCapability('ai-writing-humanizer'));

  assert.equal(review.capabilityId, 'ai-writing-humanizer');
  assert.equal(review.handoffReady, true);
  assert.equal(review.executionReady, true);
  assert.ok(review.checks.some((check) => check.id === 'no-auto-install' && check.pass));
  assert.ok(review.checks.some((check) => check.id === 'argv-array' && check.pass));
  assert.ok(review.executionGates.some((gate) => gate.id === 'reviewed-execution-adapter' && gate.pass));
  assert.ok(review.executionGates.every((gate) => gate.pass));
});

test('renderCapabilityRunnerReview separates passed gates from disabled runtime execution', () => {
  const review = reviewCapabilityRunner(getCapability('ai-writing-humanizer'));
  const out = renderCapabilityRunnerReview(review);

  assert.match(out, /^# Runner Review: AI Writing Humanizer/m);
  assert.match(out, /Handoff review: pass/);
  assert.match(out, /Execution gates: pass/);
  assert.match(out, /Runtime execution: disabled/);
  assert.match(out, /reviewed-execution-adapter/);
  assert.match(out, /timeout-limit/);
  assert.match(out, /No third-party tool will be executed/);
});

test('capabilities review --strict passes when reviewed adapter metadata is ready', () => {
  const result = spawnSync(process.execPath, ['src/cli.js', 'capabilities', 'review', 'ai-writing-humanizer', '--strict'], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8',
  });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Execution gates: pass/);
  assert.match(result.stdout, /Runtime execution: disabled/);
  assert.equal(result.stderr, '');
  assert.doesNotMatch(result.stderr, /No third-party tool will be executed/);
});

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJSON } from './util.js';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CAPABILITIES_DIR = join(REPO_ROOT, 'capabilities');
const COMMON_SEARCH_TOKENS = new Set(['ai', 'llm', 'agent', 'agents', 'codex']);

const REQUIRED_FIELDS = [
  'id',
  'title',
  'goal',
  'family',
  'status',
  'level',
  'primary_tools',
  'when_to_use',
  'when_not_to_use',
  'codex_prompt',
  'verification',
  'risks',
  'sources',
];

function validateCapability(card, file) {
  for (const field of REQUIRED_FIELDS) {
    if (!(field in card)) throw new Error(`${file}: missing ${field}`);
  }
  if (!Array.isArray(card.primary_tools)) throw new Error(`${file}: primary_tools must be an array`);
  for (const field of ['when_to_use', 'when_not_to_use', 'verification', 'risks', 'sources']) {
    if (!Array.isArray(card[field])) throw new Error(`${file}: ${field} must be an array`);
  }
  if (!Number.isInteger(card.level)) throw new Error(`${file}: level must be an integer`);
}

function bullets(items) {
  if (!items || !items.length) return '- (none)';
  return items.map((x) => `- ${x}`).join('\n');
}

function tools(items) {
  if (!items || !items.length) return '- (none)';
  return items
    .map((t) => {
      const license = t.license ? `; license: ${t.license}` : '';
      const role = t.role ? ` - ${t.role}` : '';
      return `- [${t.name}](${t.url})${role}${license}`;
    })
    .join('\n');
}

function normalizePath(p) {
  return String(p || '').replaceAll('\\', '/');
}

function timestampForRun(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-');
}

function preview(relPath) {
  if (!relPath) return '_No file specified._';
  const abs = join(REPO_ROOT, relPath);
  if (!existsSync(abs)) return `_Missing fixture file: ${normalizePath(relPath)}_`;
  const text = readFileSync(abs, 'utf8').trim();
  return text.length > 1800 ? text.slice(0, 1800).trimEnd() + '\n...' : text;
}

function writeJSONFile(filePath, obj) {
  writeFileSync(filePath, JSON.stringify(obj, null, 2) + '\n');
}

function check(id, label, pass, detail) {
  return { id, label, pass: Boolean(pass), detail };
}

function hasShellSyntax(command) {
  return command.some((part) => /[;&|<>]/.test(part));
}

function canRunFirstPartyTransform(card) {
  return card.runner?.adapter === 'first-party-text-humanizer';
}

const HUMANIZER_REPLACEMENTS = [
  {
    pattern: /\bIn today's fast-paced digital landscape,\s*/gi,
    replacement: '',
    label: 'Removed a throat-clearing trend opener.',
  },
  {
    pattern: /\bpowerful tools to unlock their full potential\b/gi,
    replacement: 'clear tools',
    label: 'Replaced vague empowerment copy with a concrete phrase.',
  },
  {
    pattern: /\bgame-changing platform that leverages cutting-edge AI to streamline workflows and empower users like never before\b/gi,
    replacement: 'toolkit that helps organize AI-assisted workflows',
    label: 'Replaced hype-heavy platform language.',
  },
  {
    pattern: /\bWhether you're a developer, founder, or creator,\s*/gi,
    replacement: '',
    label: 'Removed a generic audience setup.',
  },
  {
    pattern: /\bthis innovative solution\b/gi,
    replacement: 'this toolkit',
    label: 'Replaced vague product language.',
  },
  {
    pattern: /\btransform ideas into reality with ease\b/gi,
    replacement: 'move ideas into working projects',
    label: 'Replaced a broad promise with a plainer one.',
  },
  {
    pattern: /\bsimple, powerful, and efficient\b/gi,
    replacement: 'simple and practical',
    label: 'Reduced stacked adjectives.',
  },
  {
    pattern: /\bWith a comprehensive suite of features,\s*/gi,
    replacement: '',
    label: 'Removed broad feature-suite framing.',
  },
  {
    pattern: /\btakes your productivity to the next level and helps you stay ahead of the curve\b/gi,
    replacement: 'helps keep work moving',
    label: 'Replaced a productivity cliche.',
  },
  {
    pattern: /\bVibe Builder Toolkit is a toolkit that helps\b/g,
    replacement: 'Vibe Builder Toolkit helps',
    label: 'Removed repeated product-category wording.',
  },
];

function runFirstPartyTextHumanizer(inputText) {
  let output = String(inputText || '');
  const changes = [];

  for (const item of HUMANIZER_REPLACEMENTS) {
    item.pattern.lastIndex = 0;
    if (item.pattern.test(output)) {
      item.pattern.lastIndex = 0;
      output = output.replace(item.pattern, item.replacement);
      changes.push(item.label);
    }
    item.pattern.lastIndex = 0;
  }

  output = output
    .replace(/(^|[.!?]\s+|\n\n)([a-z])/g, (_match, prefix, letter) => prefix + letter.toUpperCase())
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd() + '\n';

  return {
    output,
    changes:
      changes.length > 0
        ? ['Removed generic AI-writing patterns.', ...changes]
        : ['No deterministic cleanup patterns matched. Review the text manually with the Codex prompt.'],
  };
}

export function loadCapabilities(dir = CAPABILITIES_DIR) {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => {
      const card = readJSON(join(dir, f));
      validateCapability(card, f);
      return card;
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function getCapability(id, cards = loadCapabilities()) {
  const card = cards.find((c) => c.id === id);
  if (!card) {
    throw new Error(`Capability not found: ${id}. Available: ${cards.map((c) => c.id).join(', ')}`);
  }
  return card;
}

export function renderCapabilityList(cards = loadCapabilities()) {
  const lines = ['# Capability Cards', ''];
  for (const c of cards) {
    lines.push(`- ${c.id} [${c.family} L${c.level}] - ${c.goal}`);
  }
  lines.push('', 'Use `agentsmd capabilities search "<goal>"` to find cards by builder goal.');
  lines.push('Use `agentsmd capabilities show <id>` for details.');
  return lines.join('\n') + '\n';
}

function flattenSearchText(value) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(flattenSearchText).join(' ');
  if (typeof value === 'object') return Object.values(value).map(flattenSearchText).join(' ');
  return '';
}

function queryTokens(query) {
  return String(query || '')
    .toLowerCase()
    .split(/[\s,.;:/|()[\]{}"'`]+/u)
    .map((token) => token.trim())
    .filter((token) => token && !COMMON_SEARCH_TOKENS.has(token));
}

function tokenMatches(text, token) {
  if (/^[a-z0-9]+$/u.test(token) && token.length <= 3) {
    return queryTokens(text).includes(token);
  }
  return text.includes(token);
}

function scoreCapability(card, query) {
  const normalizedQuery = String(query || '').trim().toLowerCase();
  if (!normalizedQuery) return 0;
  const tokens = queryTokens(normalizedQuery);
  if (!tokens.length) return 0;

  const weightedFields = [
    [card.id, 6],
    [card.title, 6],
    [card.goal, 5],
    [card.search_terms, 5],
    [card.family, 3],
    [card.when_to_use, 2],
    [card.when_not_to_use, 1],
    [card.primary_tools, 2],
    [card.codex_prompt, 1],
    [card.verification, 1],
  ];

  let score = 0;
  for (const [field, weight] of weightedFields) {
    const text = flattenSearchText(field).toLowerCase();
    if (!text) continue;
    if (text.includes(normalizedQuery)) score += weight * 4;
    for (const token of tokens) {
      if (tokenMatches(text, token)) score += weight;
    }
  }
  return score;
}

export function searchCapabilities(cards = loadCapabilities(), query) {
  return cards
    .map((card) => ({ card, score: scoreCapability(card, query) }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.card.id.localeCompare(b.card.id))
    .map((result) => result.card);
}

export function renderCapabilitySearch(query, results) {
  const lines = ['# Capability Search', '', `Query: \`${query}\``, ''];
  if (!results.length) {
    lines.push('No matching capability cards found.', '', 'Try `agentsmd capabilities list` to browse all cards.');
    return lines.join('\n') + '\n';
  }

  for (const card of results) {
    lines.push(`## ${card.title}`, '', `ID: \`${card.id}\``, `Family: \`${card.family}\``, '', card.goal, '');
    lines.push('Next commands:', '');
    lines.push(`- \`agentsmd capabilities show ${card.id}\``);
    lines.push(`- \`agentsmd capabilities demo ${card.id}\``);
    lines.push(`- \`agentsmd capabilities prompt ${card.id}\``);
    lines.push('');
  }

  return lines.join('\n') + '\n';
}

export function renderCapabilityPrompt(card) {
  return String(card.codex_prompt || '').trim() + '\n';
}

export function renderCapabilityDemo(card) {
  const demo = card.demo || {};
  if (demo.type !== 'fixture') {
    return (
      `# Demo: ${card.title}\n\n` +
      `No fixture demo is available for \`${card.id}\` yet.\n\n` +
      `Use \`agentsmd capabilities show ${card.id}\` to inspect the card and Codex prompt.\n`
    );
  }

  const input = normalizePath(demo.input);
  const output = normalizePath(demo.output);
  const explanation = normalizePath(demo.explanation);

  const lines = [
    `# Demo: ${card.title}`,
    '',
    `Capability: \`${card.id}\``,
    `Demo type: \`${demo.type}\``,
    '',
    demo.notes || 'No third-party tool is executed by this demo.',
    '',
    '## Input',
    '',
    `Path: \`${input}\``,
    '',
    '```text',
    preview(input),
    '```',
    '',
    '## Expected Output',
    '',
    `Path: \`${output}\``,
    '',
    '```markdown',
    preview(output),
    '```',
    '',
    '## Explanation',
    '',
    `Path: \`${explanation}\``,
    '',
    preview(explanation),
  ];

  return lines.join('\n') + '\n';
}

export function planCapabilityRun(card, { inputPath, now = new Date(), consent = false } = {}) {
  if (!card.runner) {
    throw new Error(`No local runner is configured for ${card.id}. Try \`agentsmd capabilities demo ${card.id}\`.`);
  }
  if (!inputPath) {
    throw new Error('Missing --input <path> for runner preview.');
  }

  const normalizedInput = normalizePath(inputPath);
  const outputDir = `.agentsmd/runs/${card.id}/${timestampForRun(now)}/`;
  const command = Array.isArray(card.runner.command) ? card.runner.command.map(String) : [];

  return {
    capabilityId: card.id,
    title: card.title,
    status: card.runner.status || 'preview-only',
    adapter: card.runner.adapter || '',
    inputPath: normalizedInput,
    outputDir,
    command,
    requiresInstall: Boolean(card.runner.requires_install),
    network: Boolean(card.runner.network),
    readsSecrets: Boolean(card.runner.reads_secrets),
    consent: Boolean(consent),
    willExecute: false,
    willExecuteFirstParty: canRunFirstPartyTransform(card) && Boolean(consent),
    notes: card.runner.notes || '',
  };
}

export function renderCapabilityRunPlan(plan) {
  const command = plan.command.length ? plan.command.map((part) => JSON.stringify(part)).join(' ') : '(not configured)';
  const lines = [
    `# Runner Preview: ${plan.title}`,
    '',
    `Capability: \`${plan.capabilityId}\``,
    `Runner status: \`${plan.status}\``,
    '',
    '## Planned IO',
    '',
    `Input: \`${plan.inputPath}\``,
    `Output directory: \`${plan.outputDir}\``,
    '',
    '## Safety Controls',
    '',
    `- Requires install: ${plan.requiresInstall ? 'yes' : 'no'}`,
    `- Network access: ${plan.network ? 'yes' : 'no'}`,
    `- Reads secrets: ${plan.readsSecrets ? 'yes' : 'no'}`,
    '- No shell invocation is planned by default.',
    '- No third-party tool will be executed by this command.',
    `- First-party local transform: ${plan.adapter ? (plan.consent ? 'yes' : 'available after --yes') : 'no'}`,
    '',
    '## Command Plan',
    '',
    '```text',
    command,
    '```',
    '',
  ];

  if (plan.consent) {
    lines.push(
      'Explicit consent received.',
      'First-party handoff files can be written for Codex review.',
      plan.willExecuteFirstParty
        ? 'First-party local transform can write reviewable output files.'
        : 'No first-party local transform is configured for this capability.',
      'Actual third-party execution is disabled in this version.',
      'No source file will be overwritten by the handoff package.'
    );
  } else {
    lines.push(
      `Use \`agentsmd capabilities run ${plan.capabilityId} --input ${plan.inputPath} --yes\` after reviewing the plan.`,
      'This command stops here until explicit consent is provided.'
    );
  }

  if (plan.notes) {
    lines.push('', '## Notes', '', plan.notes);
  }

  return lines.join('\n') + '\n';
}

export function reviewCapabilityRunner(card) {
  const runner = card.runner || {};
  const command = Array.isArray(runner.command) ? runner.command.map(String) : [];
  const hasToolAttribution =
    Array.isArray(card.primary_tools) &&
    card.primary_tools.length > 0 &&
    card.primary_tools.every((tool) => tool.name && tool.url && tool.license);
  const hasFixture =
    card.level >= 1 && card.demo?.type === 'fixture' && card.demo.input && card.demo.output && card.demo.explanation;
  const hasRunner = Boolean(card.runner);
  const hasArgvCommand = command.length > 0;

  const checks = [
    check(
      'source-attribution',
      'Capability card has source URL, license, risks, and verification notes',
      hasToolAttribution && card.sources.length > 0 && card.risks.length > 0 && card.verification.length > 0,
      'Required before any runner can claim source-grounded behavior.'
    ),
    check(
      'fixture-demo',
      'Level 1 fixture demo exists',
      hasFixture,
      'The fixture keeps the capability reviewable before local execution exists.'
    ),
    check(
      'runner-configured',
      'Runner metadata exists',
      hasRunner,
      'Cards without runner metadata should use `capabilities demo` only.'
    ),
    check(
      'no-auto-install',
      'Runner never auto-installs dependencies',
      hasRunner && runner.requires_install === false,
      'Manual install instructions are required before any future third-party execution.'
    ),
    check(
      'argv-array',
      'Runner command is an argv array, not a shell string',
      hasArgvCommand && !hasShellSyntax(command),
      'Command plans must stay inspectable and avoid shell separators.'
    ),
    check(
      'no-network-or-secrets',
      'Runner does not require network or secrets by default',
      hasRunner && !runner.network && !runner.reads_secrets,
      'Network and secret access require separate review.'
    ),
    check(
      'handoff-only-status',
      'Runner is explicitly handoff-only or reviewed for execution',
      ['handoff-only', 'reviewed-execution-adapter'].includes(String(runner.status || '')),
      'Unlabeled runner statuses must not be treated as safe.'
    ),
  ];

  const executionGates = [
    check(
      'reviewed-execution-adapter',
      'Runner status is reviewed-execution-adapter',
      runner.status === 'reviewed-execution-adapter',
      'This is the explicit switch that permits a future adapter to execute.'
    ),
    check(
      'manual-install-hint',
      'Manual install hint is documented',
      Boolean(runner.install_hint),
      'Missing tools must never trigger automatic installation.'
    ),
    check(
      'timeout-limit',
      'Timeout limit is defined',
      Number.isInteger(runner.timeout_ms) && runner.timeout_ms > 0,
      'Adapters need bounded execution before they can run.'
    ),
    check(
      'input-size-limit',
      'Maximum input size is defined',
      Number.isInteger(runner.max_input_bytes) && runner.max_input_bytes > 0,
      'Adapters need input-size limits before they can run.'
    ),
    check(
      'output-size-limit',
      'Maximum captured output size is defined',
      Number.isInteger(runner.max_output_bytes) && runner.max_output_bytes > 0,
      'Adapters need stdout/stderr limits before they can run.'
    ),
    check(
      'missing-tool-handling',
      'Missing tool handling is documented',
      Boolean(runner.missing_tool_message),
      'Users need a clear manual install path when a command is unavailable.'
    ),
    check(
      'sensitive-input-warning',
      'Sensitive or untrusted input warning is documented',
      Boolean(runner.sensitive_input_warning),
      'File-processing adapters must warn before touching user data.'
    ),
    check(
      'execution-tests',
      'Execution adapter tests are listed',
      Array.isArray(runner.tests) &&
        ['preview', 'missing-tool', 'output-path', 'refusal-without-consent'].every((name) => runner.tests.includes(name)),
      'Execution needs tests for preview, missing tools, output paths, and consent refusal.'
    ),
  ];

  const handoffReady = checks.every((item) => item.pass);
  const executionReady = handoffReady && executionGates.every((item) => item.pass);

  return {
    capabilityId: card.id,
    title: card.title,
    runnerStatus: runner.status || 'not-configured',
    handoffReady,
    executionReady,
    checks,
    executionGates,
  };
}

function renderCheckList(items) {
  return items
    .map((item) => `- [${item.pass ? 'x' : ' '}] \`${item.id}\` - ${item.label}. ${item.detail}`)
    .join('\n');
}

export function renderCapabilityRunnerReview(review) {
  return [
    `# Runner Review: ${review.title}`,
    '',
    `Capability: \`${review.capabilityId}\``,
    `Runner status: \`${review.runnerStatus}\``,
    `Handoff review: ${review.handoffReady ? 'pass' : 'fail'}`,
    `Execution gates: ${review.executionReady ? 'pass' : 'not ready'}`,
    'Third-party runtime execution: disabled',
    '',
    'No third-party tool will be executed by this review command.',
    '',
    '## Handoff Gates',
    '',
    renderCheckList(review.checks),
    '',
    '## Execution Gates',
    '',
    renderCheckList(review.executionGates),
    '',
    review.executionReady
      ? 'This runner has the metadata required for a reviewed execution adapter. `capabilities run` may write first-party preview files for reviewed adapters, while third-party execution remains disabled.'
      : 'Keep using preview and first-party handoff packages until every execution gate passes.',
    '',
  ].join('\n');
}

export function writeCapabilityRunHandoff(card, plan, { cwd = process.cwd() } = {}) {
  if (!plan.consent) {
    throw new Error('Refusing to write runner handoff without --yes.');
  }
  if (plan.capabilityId !== card.id) {
    throw new Error(`Runner plan/card mismatch: ${plan.capabilityId} vs ${card.id}`);
  }

  const outputDir = join(cwd, plan.outputDir.replace(/[\\/]$/, ''));
  const inputFile = isAbsolute(plan.inputPath) ? plan.inputPath : join(cwd, plan.inputPath);
  const input = readFileSync(inputFile);
  const inputText = input.toString('utf8');
  mkdirSync(outputDir, { recursive: true });

  writeJSONFile(join(outputDir, 'input-manifest.json'), {
    capability_id: card.id,
    input_path: plan.inputPath,
    input_bytes: input.byteLength,
    input_sha256: createHash('sha256').update(input).digest('hex'),
  });

  writeJSONFile(join(outputDir, 'command.json'), {
    argv: plan.command,
    runner_status: plan.status,
    adapter: plan.adapter,
    requires_install: plan.requiresInstall,
    network: plan.network,
    reads_secrets: plan.readsSecrets,
    executed_first_party: plan.willExecuteFirstParty,
    executed_third_party: false,
  });

  writeFileSync(join(outputDir, 'prompt.md'), renderCapabilityPrompt(card));
  writeFileSync(join(outputDir, 'input.md'), inputText);
  const files = ['input-manifest.json', 'command.json', 'prompt.md', 'input.md', 'stdout.txt', 'stderr.txt', 'RUN.md'];
  if (plan.willExecuteFirstParty) {
    const transform = runFirstPartyTextHumanizer(inputText);
    writeFileSync(join(outputDir, 'output.md'), transform.output);
    writeFileSync(join(outputDir, 'changes.md'), bullets(transform.changes) + '\n');
    files.splice(4, 0, 'output.md', 'changes.md');
  }
  writeFileSync(join(outputDir, 'stdout.txt'), '');
  writeFileSync(join(outputDir, 'stderr.txt'), '');
  const nextSteps = plan.willExecuteFirstParty
    ? [
        'Review `output.md` before copying it anywhere.',
        'Use `changes.md` to see which deterministic cleanup patterns matched.',
        'Open `prompt.md` and `input.md` if you want Codex to do a fuller editorial pass.',
      ]
    : ['Open `prompt.md` and `input.md`, then ask Codex to apply the prompt to the input.'];

  writeFileSync(
    join(outputDir, 'RUN.md'),
    [
      `# Capability Run: ${card.title}`,
      '',
      `Capability: \`${card.id}\``,
      `Input: \`${plan.inputPath}\``,
      `Output directory: \`${plan.outputDir}\``,
      `First-party transform: ${plan.willExecuteFirstParty ? 'completed' : 'not configured'}`,
      'Third-party execution: disabled',
      '',
      '## Next Step',
      '',
      ...nextSteps,
      'Review the result manually before replacing any source file.',
      '',
    ].join('\n')
  );

  return {
    outputDir,
    files,
    executedFirstParty: plan.willExecuteFirstParty,
    executedThirdParty: false,
  };
}

export function renderCapabilityShow(card) {
  const lines = [
    `# ${card.title}`,
    '',
    `ID: \`${card.id}\``,
    `Family: \`${card.family}\``,
    `Status: \`${card.status}\``,
    `Demo level: L${card.level}`,
    '',
    '## Goal',
    '',
    card.goal,
    '',
    '## Tools',
    '',
    tools(card.primary_tools),
    '',
    '## When To Use',
    '',
    bullets(card.when_to_use),
    '',
    '## When Not To Use',
    '',
    bullets(card.when_not_to_use),
    '',
    '## Codex Prompt',
    '',
    '```text',
    String(card.codex_prompt || '').trim(),
    '```',
    '',
    '## Verification',
    '',
    bullets(card.verification),
    '',
    '## Risks',
    '',
    bullets(card.risks),
    '',
    '## Sources',
    '',
    bullets(card.sources),
  ];
  return lines.join('\n') + '\n';
}

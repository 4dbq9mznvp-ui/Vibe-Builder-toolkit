import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJSON } from './util.js';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CAPABILITIES_DIR = join(REPO_ROOT, 'capabilities');

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

function preview(relPath) {
  if (!relPath) return '_No file specified._';
  const abs = join(REPO_ROOT, relPath);
  if (!existsSync(abs)) return `_Missing fixture file: ${normalizePath(relPath)}_`;
  const text = readFileSync(abs, 'utf8').trim();
  return text.length > 1800 ? text.slice(0, 1800).trimEnd() + '\n...' : text;
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
  lines.push('', 'Use `agentsmd capabilities show <id>` for details.');
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

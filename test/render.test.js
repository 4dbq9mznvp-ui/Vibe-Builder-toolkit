import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderAgents } from '../src/render/agents.js';
import { renderCursor } from '../src/render/cursor.js';
import { renderClaude } from '../src/render/claude.js';
import { renderMcp } from '../src/render/mcp.js';

const profile = {
  name: 'Test',
  oneLiner: '한 줄 설명',
  stack: ['Next.js', 'Supabase'],
  packageManager: 'pnpm',
  commands: { test: 'pnpm test' },
  conventions: ['c1'],
  doNot: ['d1'],
  security: ['s1'],
  reviewCriteria: ['r1'],
  priorities: ['p1'],
  mcp: ['github', 'supabase'],
};

test('renderAgents includes key sections and Korean values', () => {
  const md = renderAgents(profile);
  assert.match(md, /^# AGENTS\.md/);
  assert.match(md, /\*\*Test\*\*/);
  assert.match(md, /Next\.js/);
  assert.match(md, /## Do NOT/);
  assert.match(md, /## Security/);
  assert.match(md, /한 줄 설명/);
});

test('renderCursor has MDC frontmatter with alwaysApply', () => {
  const out = renderCursor(profile);
  assert.match(out, /^---/);
  assert.match(out, /alwaysApply: true/);
  assert.match(out, /Next\.js/);
});

test('renderClaude mirrors the body and adds Claude notes', () => {
  const out = renderClaude(profile);
  assert.match(out, /# CLAUDE\.md/);
  assert.match(out, /Notes for Claude Code/);
  assert.match(out, /Next\.js/);
});

test('renderMcp emits valid JSON with only selected servers and no real secrets', () => {
  const json = JSON.parse(renderMcp(profile));
  assert.ok(json.mcpServers.github);
  assert.ok(json.mcpServers.supabase);
  assert.equal(json.mcpServers.filesystem, undefined);
  assert.match(JSON.stringify(json), /\$\{GITHUB_PERSONAL_ACCESS_TOKEN\}/);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildAgentsMessages, resolveModel } from '../src/lib/ai.js';

test('buildAgentsMessages returns system + user with the profile embedded', () => {
  const msgs = buildAgentsMessages({ name: 'X', oneLiner: '한 줄', stack: ['Next.js'] });
  assert.equal(msgs.length, 2);
  assert.equal(msgs[0].role, 'system');
  assert.equal(msgs[1].role, 'user');
  assert.match(msgs[1].content, /"name": "X"/);
  assert.match(msgs[1].content, /한 줄/);
  assert.match(msgs[1].content, /Do NOT/);
});

test('resolveModel falls back to default, honors override', () => {
  const prev = process.env.OPENAI_MODEL;
  delete process.env.OPENAI_MODEL;
  assert.equal(resolveModel(), 'gpt-4o-mini');
  assert.equal(resolveModel('custom-model'), 'custom-model');
  if (prev !== undefined) process.env.OPENAI_MODEL = prev;
});

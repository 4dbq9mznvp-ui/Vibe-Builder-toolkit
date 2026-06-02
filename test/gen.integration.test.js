import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { cmdGen } from '../src/commands/gen.js';
import { STARTER_PROFILE } from '../src/lib/profile.js';

test('gen --out writes all four targets from a config', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'agentsmd-test-'));
  try {
    writeFileSync(join(dir, 'agentsmd.config.json'), JSON.stringify(STARTER_PROFILE));
    await cmdGen(['--out', dir]);
    assert.ok(existsSync(join(dir, 'AGENTS.md')), 'AGENTS.md');
    assert.ok(existsSync(join(dir, 'CLAUDE.md')), 'CLAUDE.md');
    assert.ok(existsSync(join(dir, '.cursor', 'rules', 'agentsmd.mdc')), 'cursor rules');
    assert.ok(existsSync(join(dir, '.mcp.json')), '.mcp.json');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

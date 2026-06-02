import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RECIPES = join(dirname(fileURLToPath(import.meta.url)), '..', 'recipes');

test('every bundled recipe has the required shape', () => {
  const files = readdirSync(RECIPES).filter((f) => f.endsWith('.json'));
  assert.ok(files.length > 0, 'has at least one recipe');
  for (const f of files) {
    const r = JSON.parse(readFileSync(join(RECIPES, f), 'utf8'));
    assert.ok(r.name, `${f}: name`);
    assert.ok(r.title, `${f}: title`);
    assert.ok(Array.isArray(r.steps) && r.steps.length, `${f}: steps`);
    for (const s of r.steps) {
      assert.ok(s.id && s.title, `${f}: step id+title`);
    }
  }
});

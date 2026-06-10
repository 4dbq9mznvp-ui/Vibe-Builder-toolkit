import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { loadRecipes, validateRecipe } from '../src/lib/recipes.js';

const RECIPES = join(dirname(fileURLToPath(import.meta.url)), '..', 'recipes');
const CLI = fileURLToPath(new URL('../src/cli.js', import.meta.url));

const validRecipe = () => ({
  name: 'my-local-flow',
  title: 'Local flow',
  tags: ['local'],
  steps: [{ id: 'one', title: 'Step one', prompt: 'Do it.', check: 'node --version', done: 'Done.' }],
});

function withLocalRecipe(recipe, fn) {
  const dir = mkdtempSync(join(tmpdir(), 'agentsmd-recipes-'));
  try {
    mkdirSync(join(dir, '.agentsmd', 'recipes'), { recursive: true });
    writeFileSync(join(dir, '.agentsmd', 'recipes', 'local.json'), JSON.stringify(recipe, null, 2));
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('every bundled recipe passes validation', () => {
  const files = readdirSync(RECIPES).filter((f) => f.endsWith('.json'));
  assert.ok(files.length > 0, 'has at least one recipe');
  for (const f of files) {
    const recipe = JSON.parse(readFileSync(join(RECIPES, f), 'utf8'));
    assert.deepEqual(validateRecipe(recipe, f), [], `${f} is valid`);
  }
});

test('validateRecipe reports name, steps, and duplicate-id problems', () => {
  assert.deepEqual(validateRecipe(validRecipe()), []);

  const badName = validateRecipe({ ...validRecipe(), name: 'Bad Name!' }, 'x.json');
  assert.ok(badName.some((p) => p.includes('name must be a lowercase slug')));

  const noSteps = validateRecipe({ ...validRecipe(), steps: [] }, 'x.json');
  assert.ok(noSteps.some((p) => p.includes('steps must be a non-empty array')));

  const dupIds = validateRecipe(
    {
      ...validRecipe(),
      steps: [
        { id: 'one', title: 'A' },
        { id: 'one', title: 'B' },
      ],
    },
    'x.json'
  );
  assert.ok(dupIds.some((p) => p.includes('duplicates "one"')));

  const badField = validateRecipe({ ...validRecipe(), steps: [{ id: 'one', title: 'A', check: 42 }] }, 'x.json');
  assert.ok(badField.some((p) => p.includes('.check must be a string')));

  assert.ok(validateRecipe(null, 'x.json')[0].includes('must be a JSON object'));
});

test('loadRecipes discovers project-local recipes alongside bundled ones', () =>
  withLocalRecipe(validRecipe(), (dir) => {
    const recipes = loadRecipes(dir);
    const local = recipes.find((r) => r.name === 'my-local-flow');
    assert.ok(local, 'local recipe is discovered');
    assert.equal(local.source, 'local');
    assert.ok(recipes.some((r) => r.name === 'demo-hello' && r.source === 'bundled'));
  }));

test('a local recipe overrides a bundled recipe with the same name', () =>
  withLocalRecipe({ ...validRecipe(), name: 'demo-hello', title: 'Overridden demo' }, (dir) => {
    const recipes = loadRecipes(dir);
    const matches = recipes.filter((r) => r.name === 'demo-hello');
    assert.equal(matches.length, 1);
    assert.equal(matches[0].title, 'Overridden demo');
    assert.equal(matches[0].source, 'local');
  }));

test('loadRecipes throws a useful error for an invalid local recipe', () =>
  withLocalRecipe({ name: 'broken', title: '', steps: [] }, (dir) => {
    assert.throws(() => loadRecipes(dir), /title must be a non-empty string.*recipes validate/s);
  }));

test('recipes validate passes for bundled recipes and fails on a broken local recipe', () => {
  const clean = spawnSync(process.execPath, [CLI, 'recipes', 'validate'], {
    cwd: mkdtempSync(join(tmpdir(), 'agentsmd-recipes-cli-')),
    encoding: 'utf8',
  });
  assert.equal(clean.status, 0);
  assert.match(clean.stdout, /recipe file\(s\) are valid/);

  withLocalRecipe({ name: 'broken', steps: [] }, (dir) => {
    const result = spawnSync(process.execPath, [CLI, 'recipes', 'validate'], { cwd: dir, encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stdout, /title must be a non-empty string/);
    assert.match(result.stdout, /failed validation/);
  });
});

test('plan can use a project-local recipe end to end', () =>
  withLocalRecipe(validRecipe(), (dir) => {
    const result = spawnSync(process.execPath, [CLI, 'plan', '--recipe', 'my-local-flow'], {
      cwd: dir,
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /plan created/);
    assert.ok(existsSync(join(dir, '.agentsmd', 'BUILD_PLAN.md')));
    const state = JSON.parse(readFileSync(join(dir, '.agentsmd', 'state.json'), 'utf8'));
    assert.equal(state.recipe, 'my-local-flow');
    assert.equal(state.steps.length, 1);
  }));

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdirSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { readJSON, exists, c } from '../lib/util.js';
import { saveState, planPath } from '../lib/state.js';

const RECIPES_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'recipes');

function loadRecipes() {
  return readdirSync(RECIPES_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => readJSON(join(RECIPES_DIR, f)));
}

function pickRecipe(recipes, name, goal) {
  if (name) {
    const r = recipes.find((x) => x.name === name);
    if (!r) {
      throw new Error(
        `Recipe not found: ${name}. Available: ${recipes.map((x) => x.name).join(', ')}`
      );
    }
    return r;
  }
  const g = (goal || '').toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const r of recipes) {
    const score = (r.tags || []).filter((t) => g.includes(String(t).toLowerCase())).length;
    if (score > bestScore) {
      best = r;
      bestScore = score;
    }
  }
  return best || recipes.find((x) => x.name === 'demo-hello') || recipes[0];
}

export async function cmdPlan(args) {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      recipe: { type: 'string' },
      list: { type: 'boolean' },
      force: { type: 'boolean' },
    },
  });
  const cwd = process.cwd();
  const recipes = loadRecipes();

  if (values.list) {
    console.log(c.bold('Available recipes:'));
    for (const r of recipes) {
      console.log(`  ${c.cyan(r.name)} — ${r.title} ${c.gray('[' + (r.tags || []).join(', ') + ']')}`);
    }
    return;
  }

  const goal = positionals.join(' ').trim();
  const recipe = pickRecipe(recipes, values.recipe, goal);

  if (exists(planPath(cwd)) && !values.force) {
    console.log(c.yellow('A plan already exists in .agentsmd/.'), c.gray('Use --force to replace it.'));
    return;
  }

  const state = {
    goal: goal || recipe.title,
    recipe: recipe.name,
    createdAt: new Date().toISOString(),
    current: 0,
    steps: recipe.steps.map((s) => ({ ...s, status: 'pending' })),
  };
  saveState(cwd, state);
  console.log(c.green('✓ plan created'), c.gray('-> .agentsmd/BUILD_PLAN.md'));
  console.log(`  recipe: ${c.cyan(recipe.name)} · ${state.steps.length} steps`);
  console.log(`\n  Next: ${c.cyan('agentsmd run')}`);
}

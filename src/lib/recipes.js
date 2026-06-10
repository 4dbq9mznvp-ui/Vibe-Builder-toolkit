import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readdirSync } from 'node:fs';
import { readJSON } from './util.js';

const BUNDLED_RECIPES_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'recipes');

export const localRecipesDir = (cwd) => join(cwd, '.agentsmd', 'recipes');

const NAME_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

// Returns a list of human-readable problems; an empty list means the recipe is valid.
export function validateRecipe(recipe, source = 'recipe') {
  const problems = [];
  if (!recipe || typeof recipe !== 'object' || Array.isArray(recipe)) {
    return [`${source}: recipe must be a JSON object`];
  }
  if (typeof recipe.name !== 'string' || !NAME_PATTERN.test(recipe.name)) {
    problems.push(`${source}: name must be a lowercase slug (a-z, 0-9, hyphens), got ${JSON.stringify(recipe.name)}`);
  }
  if (typeof recipe.title !== 'string' || !recipe.title.trim()) {
    problems.push(`${source}: title must be a non-empty string`);
  }
  if (recipe.tags !== undefined && (!Array.isArray(recipe.tags) || recipe.tags.some((t) => typeof t !== 'string'))) {
    problems.push(`${source}: tags must be an array of strings`);
  }
  if (!Array.isArray(recipe.steps) || !recipe.steps.length) {
    problems.push(`${source}: steps must be a non-empty array`);
    return problems;
  }
  const seenIds = new Set();
  recipe.steps.forEach((step, index) => {
    const label = `${source}: steps[${index}]`;
    if (!step || typeof step !== 'object' || Array.isArray(step)) {
      problems.push(`${label} must be an object`);
      return;
    }
    if (typeof step.id !== 'string' || !step.id.trim()) {
      problems.push(`${label}.id must be a non-empty string`);
    } else if (seenIds.has(step.id)) {
      problems.push(`${label}.id duplicates "${step.id}"`);
    } else {
      seenIds.add(step.id);
    }
    if (typeof step.title !== 'string' || !step.title.trim()) {
      problems.push(`${label}.title must be a non-empty string`);
    }
    for (const field of ['prompt', 'check', 'done']) {
      if (step[field] !== undefined && typeof step[field] !== 'string') {
        problems.push(`${label}.${field} must be a string when present`);
      }
    }
  });
  return problems;
}

function readRecipeDir(dir, source) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => ({ file: join(dir, f), source }));
}

// Bundled recipes plus project-local .agentsmd/recipes/*.json; a local recipe
// with the same name intentionally overrides the bundled one.
export function listRecipeFiles(cwd = process.cwd()) {
  return [...readRecipeDir(BUNDLED_RECIPES_DIR, 'bundled'), ...readRecipeDir(localRecipesDir(cwd), 'local')];
}

export function loadRecipes(cwd = process.cwd()) {
  const byName = new Map();
  for (const { file, source } of listRecipeFiles(cwd)) {
    const recipe = readJSON(file);
    const problems = validateRecipe(recipe, file);
    if (problems.length) {
      throw new Error(`Invalid recipe.\n${problems.join('\n')}\nRun \`agentsmd recipes validate\` for a full report.`);
    }
    byName.set(recipe.name, { ...recipe, source });
  }
  return [...byName.values()];
}

import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { listRecipeFiles, loadRecipes, validateRecipe } from '../lib/recipes.js';
import { readJSON, c } from '../lib/util.js';

const HELP = `${c.bold('agentsmd recipes')} - inspect and validate build recipes

${c.bold('Usage:')}
  agentsmd recipes list                  List bundled and project-local recipes
  agentsmd recipes validate              Validate all bundled and local recipes
  agentsmd recipes validate --file <p>   Validate one recipe file

Project-local recipes live in .agentsmd/recipes/*.json and may override a
bundled recipe with the same name. See docs/RECIPE_SPEC.md for the format.
`;

function validateFiles(entries) {
  let failed = 0;
  for (const { file, source } of entries) {
    let problems;
    try {
      problems = validateRecipe(readJSON(file), file);
    } catch (e) {
      problems = [`${file}: invalid JSON - ${e.message}`];
    }
    if (problems.length) {
      failed++;
      console.log(c.red('✗'), `${file} ${c.gray('[' + source + ']')}`);
      for (const problem of problems) console.log('   ' + problem);
    } else {
      console.log(c.green('✓'), `${file} ${c.gray('[' + source + ']')}`);
    }
  }
  return failed;
}

export async function cmdRecipes(args) {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      help: { type: 'boolean', short: 'h' },
      file: { type: 'string' },
    },
  });

  if (values.help) {
    console.log(HELP);
    return;
  }

  const [subcommand = 'list'] = positionals;
  const cwd = process.cwd();

  switch (subcommand) {
    case 'list': {
      const recipes = loadRecipes(cwd);
      console.log(c.bold('Available recipes:'));
      for (const r of recipes) {
        const tags = c.gray('[' + (r.tags || []).join(', ') + ']');
        const source = r.source === 'local' ? c.cyan(' (local)') : '';
        console.log(`  ${c.cyan(r.name)}${source} — ${r.title} ${tags} · ${r.steps.length} steps`);
      }
      console.log(c.gray(`\nLocal recipes: .agentsmd/recipes/*.json (override bundled names).`));
      break;
    }
    case 'validate': {
      const entries = values.file
        ? [{ file: resolve(cwd, values.file), source: 'file' }]
        : listRecipeFiles(cwd);
      if (!entries.length) {
        console.log(c.yellow('No recipe files found.'));
        return;
      }
      const failed = validateFiles(entries);
      if (failed) {
        console.log(c.red(`\n${failed} recipe file(s) failed validation.`));
        process.exitCode = 1;
      } else {
        console.log(c.green(`\nAll ${entries.length} recipe file(s) are valid.`));
      }
      break;
    }
    case 'help':
      console.log(HELP);
      break;
    default:
      throw new Error(`Unknown recipes command: ${subcommand}. Try \`agentsmd recipes --help\`.`);
  }
}

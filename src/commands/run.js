import { execSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { loadState, saveState, progress } from '../lib/state.js';
import { c } from '../lib/util.js';

function indent(text) {
  return String(text)
    .split('\n')
    .map((l) => '    ' + l)
    .join('\n');
}

function printStep(i, step, total) {
  console.log(c.bold(`\nStep ${i + 1}/${total}: ${step.title}`));
  if (step.prompt) {
    console.log(c.gray('\n  Prompt for your agent (Codex / Claude / Cursor):'));
    console.log(indent(step.prompt));
  }
  if (step.check) console.log(c.gray('\n  Verify: ') + '`' + step.check + '`');
  if (step.done) console.log(c.gray('  Done when: ') + step.done);
}

export async function cmdRun(args) {
  const { values } = parseArgs({
    args,
    allowPositionals: true,
    options: { verify: { type: 'boolean' }, skip: { type: 'boolean' } },
  });
  const cwd = process.cwd();
  const state = loadState(cwd);
  if (!state) {
    console.log(c.yellow('No plan found.'), c.gray('Run `agentsmd plan "<goal>"` first.'));
    process.exitCode = 1;
    return;
  }
  const total = state.steps.length;
  if (state.current >= total) {
    console.log(c.green('🎉 All steps complete.'));
    return;
  }
  const i = state.current;
  const step = state.steps[i];

  if (values.skip) {
    step.status = 'completed';
    step.skipped = true;
    state.current = i + 1;
    saveState(cwd, state);
    console.log(c.yellow(`↷ skipped step ${i + 1}: ${step.title}`));
    if (state.current < total) printStep(state.current, state.steps[state.current], total);
    else console.log(c.green('\n🎉 All steps complete!'));
    return;
  }

  if (!values.verify) {
    printStep(i, step, total);
    console.log(c.gray('\n  When the work is done: ') + c.cyan('agentsmd run --verify'));
    return;
  }

  // --verify: run the step's check command
  if (step.check) {
    console.log(c.gray('$ ' + step.check));
    try {
      execSync(step.check, { cwd, stdio: 'inherit', shell: true });
    } catch {
      console.log(c.red(`\n✗ Check failed. Step ${i + 1} stays open.`));
      process.exitCode = 1;
      return;
    }
  }
  step.status = 'completed';
  step.completedAt = new Date().toISOString();
  state.current = i + 1;
  saveState(cwd, state);
  const { done, total: t } = progress(state);
  console.log(c.green(`\n✓ Step ${i + 1} complete`) + c.gray(` (${done}/${t})`));
  if (state.current < total) printStep(state.current, state.steps[state.current], total);
  else console.log(c.green('\n🎉 All steps complete!'));
}

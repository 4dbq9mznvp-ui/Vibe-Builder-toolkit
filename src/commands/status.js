import { loadState, progress } from '../lib/state.js';
import { c } from '../lib/util.js';

export async function cmdStatus() {
  const cwd = process.cwd();
  const state = loadState(cwd);
  if (!state) {
    console.log(c.yellow('No plan yet.'), c.gray('Run `agentsmd plan "<goal>"`.'));
    return;
  }
  const { done, total } = progress(state);
  console.log(c.bold(`\n${state.goal}`));
  console.log(c.gray(`recipe ${state.recipe} · ${done}/${total} done`));
  console.log('');
  state.steps.forEach((s, i) => {
    const icon =
      s.status === 'completed' ? c.green('✓') : i === state.current ? c.cyan('▶') : c.gray('·');
    const label = s.status === 'completed' ? c.gray(s.title) : s.title;
    console.log(`  ${icon} ${i + 1}. ${label}`);
  });
  console.log('');
}

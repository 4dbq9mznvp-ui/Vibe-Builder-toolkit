import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { loadProfile } from '../lib/profile.js';
import { renderAgents } from '../render/agents.js';
import { renderClaude } from '../render/claude.js';
import { renderCursor } from '../render/cursor.js';
import { renderMcp } from '../render/mcp.js';
import { writeText, c } from '../lib/util.js';

const TARGETS = {
  agents: ['AGENTS.md', renderAgents],
  claude: ['CLAUDE.md', renderClaude],
  cursor: ['.cursor/rules/agentsmd.mdc', renderCursor],
  mcp: ['.mcp.json', renderMcp],
};

export async function cmdGen(args) {
  const { values } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      targets: { type: 'string' },
      out: { type: 'string' },
      'dry-run': { type: 'boolean' },
    },
  });
  const cwd = values.out ? resolve(process.cwd(), values.out) : process.cwd();
  const profile = loadProfile(cwd);
  const targets = (values.targets || 'agents,claude,cursor,mcp')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  let count = 0;
  for (const t of targets) {
    const entry = TARGETS[t];
    if (!entry) {
      console.log(c.yellow(`skip unknown target: ${t}`));
      continue;
    }
    const [rel, render] = entry;
    const content = render(profile);
    if (values['dry-run']) {
      console.log(c.gray('would write'), rel);
      continue;
    }
    writeText(join(cwd, rel), content);
    console.log(c.green('✓'), rel);
    count++;
  }
  if (!values['dry-run']) {
    console.log(c.gray(`\nSingle source: agentsmd.config.json -> ${count} file(s) in sync.`));
  }
}

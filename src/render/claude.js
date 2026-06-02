import { agentsBody } from './agents.js';

export function renderClaude(p) {
  return `# CLAUDE.md

This file guides Claude Code in this repo. It is generated from \`agentsmd.config.json\`
(single source of truth) and mirrors \`AGENTS.md\`. Edit the config, then run \`agentsmd gen\`.

${agentsBody(p)}

## Notes for Claude Code
- Prefer small, reviewable diffs; explain non-obvious changes.
- Run the relevant command under **Commands** before claiming a task is done.
- Treat **Do NOT** and **Security** as hard constraints.
`;
}

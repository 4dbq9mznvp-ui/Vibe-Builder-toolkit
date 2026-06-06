#!/usr/bin/env node
import { cmdInit } from './commands/init.js';
import { cmdGen } from './commands/gen.js';
import { cmdPlan } from './commands/plan.js';
import { cmdRun } from './commands/run.js';
import { cmdStatus } from './commands/status.js';
import { cmdCapabilities } from './commands/capabilities.js';
import { c } from './lib/util.js';

const VERSION = '0.9.0';

const HELP = `${c.bold('agentsmd')} - single source -> agent configs + a vibe-building conductor

${c.bold('Usage:')}
  agentsmd init             Create a starter agentsmd.config.json
  agentsmd gen              Generate AGENTS.md, CLAUDE.md, .cursor rules, .mcp.json
  agentsmd plan "<goal>"    Turn a goal into a tracked build plan (pick a recipe)
  agentsmd run              Show the current step (prompt + how to verify)
  agentsmd run --verify     Run the step's check; on pass, advance
  agentsmd status           Show progress
  agentsmd capabilities     List capability cards

${c.bold('Options:')}
  gen    --targets a,b,c   --out <dir>   --ai   --model <name>   --dry-run
  capabilities list | show <id> | prompt <id> | demo <id> | review <id> [--strict] | run <id> --input <path> [--yes]
  plan   --recipe <name>   --list        --force
  run    --verify          --skip

  -h, --help        Show this help
  -v, --version     Show version
`;

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  switch (command) {
    case undefined:
    case 'help':
    case '-h':
    case '--help':
      console.log(HELP);
      break;
    case 'version':
    case '-v':
    case '--version':
      console.log(VERSION);
      break;
    case 'init':
      await cmdInit(rest);
      break;
    case 'gen':
      await cmdGen(rest);
      break;
    case 'plan':
      await cmdPlan(rest);
      break;
    case 'run':
      await cmdRun(rest);
      break;
    case 'status':
      await cmdStatus(rest);
      break;
    case 'capabilities':
      await cmdCapabilities(rest);
      break;
    default:
      console.error(c.red(`Unknown command: ${command}`));
      console.log(HELP);
      process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(c.red('Error:'), e.message);
  process.exitCode = 1;
});

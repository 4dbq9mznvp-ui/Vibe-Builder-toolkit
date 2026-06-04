import { parseArgs } from 'node:util';
import {
  getCapability,
  loadCapabilities,
  renderCapabilityList,
  renderCapabilityDemo,
  renderCapabilityPrompt,
  renderCapabilityShow,
} from '../lib/capabilities.js';
import { c } from '../lib/util.js';

const HELP = `${c.bold('agentsmd capabilities')} - inspect Vibe Builder capability cards

${c.bold('Usage:')}
  agentsmd capabilities list
  agentsmd capabilities show <id>
  agentsmd capabilities prompt <id>
  agentsmd capabilities demo <id>

${c.bold('Examples:')}
  agentsmd capabilities list
  agentsmd capabilities show pdf-to-markdown
  agentsmd capabilities prompt ui-taste-review
  agentsmd capabilities demo ai-writing-humanizer
`;

export async function cmdCapabilities(args) {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      help: { type: 'boolean', short: 'h' },
    },
  });

  if (values.help) {
    console.log(HELP);
    return;
  }

  const [subcommand = 'list', id] = positionals;
  const cards = loadCapabilities();

  switch (subcommand) {
    case 'list':
      console.log(renderCapabilityList(cards).trimEnd());
      break;
    case 'show':
      if (!id) throw new Error('Missing capability id. Try `agentsmd capabilities list`.');
      console.log(renderCapabilityShow(getCapability(id, cards)).trimEnd());
      break;
    case 'prompt':
      if (!id) throw new Error('Missing capability id. Try `agentsmd capabilities list`.');
      console.log(renderCapabilityPrompt(getCapability(id, cards)).trimEnd());
      break;
    case 'demo':
      if (!id) throw new Error('Missing capability id. Try `agentsmd capabilities list`.');
      console.log(renderCapabilityDemo(getCapability(id, cards)).trimEnd());
      break;
    case 'help':
      console.log(HELP);
      break;
    default:
      throw new Error(`Unknown capabilities command: ${subcommand}. Try \`agentsmd capabilities --help\`.`);
  }
}

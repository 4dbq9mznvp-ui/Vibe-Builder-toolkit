import { parseArgs } from 'node:util';
import {
  capabilityJSON,
  getCapability,
  loadCapabilities,
  planCapabilityRun,
  renderCapabilityList,
  searchResultsJSON,
  renderCapabilityDemo,
  renderCapabilityPrompt,
  renderCapabilitySearch,
  renderCapabilityRunnerReview,
  renderCapabilityRunResult,
  renderCapabilityRunPlan,
  renderCapabilityShow,
  reviewCapabilityRunner,
  searchCapabilities,
  writeCapabilityRunHandoff,
} from '../lib/capabilities.js';
import { c } from '../lib/util.js';

const HELP = `${c.bold('agentsmd capabilities')} - inspect Vibe Builder capability cards

${c.bold('Usage:')}
  agentsmd capabilities list
  agentsmd capabilities search "<goal>" [--json]
  agentsmd capabilities show <id> [--json]
  agentsmd capabilities prompt <id>
  agentsmd capabilities demo <id>
  agentsmd capabilities review <id> [--strict]
  agentsmd capabilities run <id> --input <path> [--yes]

${c.bold('Examples:')}
  agentsmd capabilities list
  agentsmd capabilities search "PDF 정리"
  agentsmd capabilities show pdf-to-markdown
  agentsmd capabilities prompt ui-taste-review
  agentsmd capabilities demo ai-writing-humanizer
  agentsmd capabilities review ai-writing-humanizer
  agentsmd capabilities review ai-writing-humanizer --strict
  agentsmd capabilities run ai-writing-humanizer --input draft.md
`;

export async function cmdCapabilities(args) {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      help: { type: 'boolean', short: 'h' },
      input: { type: 'string', short: 'i' },
      yes: { type: 'boolean', short: 'y' },
      strict: { type: 'boolean' },
      json: { type: 'boolean' },
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
    case 'search': {
      if (!id) throw new Error('Missing search query. Try `agentsmd capabilities search "PDF cleanup"`.');
      const query = positionals.slice(1).join(' ');
      const results = searchCapabilities(cards, query);
      if (values.json) {
        console.log(JSON.stringify(searchResultsJSON(query, results), null, 2));
      } else {
        console.log(renderCapabilitySearch(query, results).trimEnd());
      }
      break;
    }
    case 'show':
      if (!id) throw new Error('Missing capability id. Try `agentsmd capabilities list`.');
      if (values.json) {
        console.log(JSON.stringify(capabilityJSON(getCapability(id, cards)), null, 2));
      } else {
        console.log(renderCapabilityShow(getCapability(id, cards)).trimEnd());
      }
      break;
    case 'prompt':
      if (!id) throw new Error('Missing capability id. Try `agentsmd capabilities list`.');
      console.log(renderCapabilityPrompt(getCapability(id, cards)).trimEnd());
      break;
    case 'demo':
      if (!id) throw new Error('Missing capability id. Try `agentsmd capabilities list`.');
      console.log(renderCapabilityDemo(getCapability(id, cards)).trimEnd());
      break;
    case 'review':
      if (!id) throw new Error('Missing capability id. Try `agentsmd capabilities list`.');
      {
        const review = reviewCapabilityRunner(getCapability(id, cards));
        console.log(renderCapabilityRunnerReview(review).trimEnd());
        if (values.strict && !review.executionReady) {
          throw new Error(`Runner execution gates are not ready for ${review.capabilityId}.`);
        }
      }
      break;
    case 'run':
      if (!id) throw new Error('Missing capability id. Try `agentsmd capabilities list`.');
      {
        const card = getCapability(id, cards);
        const plan = planCapabilityRun(card, {
          inputPath: values.input,
          consent: values.yes,
        });
        console.log(renderCapabilityRunPlan(plan).trimEnd());
        if (values.yes) {
          const result = writeCapabilityRunHandoff(card, plan);
          console.log('\n' + renderCapabilityRunResult(result).trimEnd());
        }
      }
      break;
    case 'help':
      console.log(HELP);
      break;
    default:
      throw new Error(`Unknown capabilities command: ${subcommand}. Try \`agentsmd capabilities --help\`.`);
  }
}

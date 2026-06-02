import { join } from 'node:path';
import { STARTER_PROFILE } from '../lib/profile.js';
import { exists, writeJSON, c } from '../lib/util.js';

export async function cmdInit(args) {
  const force = args.includes('--force');
  const cwd = process.cwd();
  const cfg = join(cwd, 'agentsmd.config.json');
  if (exists(cfg) && !force) {
    console.log(c.yellow('agentsmd.config.json already exists.'), c.gray('Use --force to overwrite.'));
    return;
  }
  writeJSON(cfg, STARTER_PROFILE);
  console.log(c.green('✓ created'), 'agentsmd.config.json');
  console.log(c.gray('  Edit it, then run:'), c.cyan('agentsmd gen'));
}

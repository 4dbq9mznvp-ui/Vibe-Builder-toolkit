// Curated catalog of common MCP servers.
// Package names are best-effort — verify against each server's current docs
// before relying on them. env values use ${VAR} placeholders.
export const MCP_CATALOG = {
  github: {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    env: { GITHUB_PERSONAL_ACCESS_TOKEN: '${GITHUB_PERSONAL_ACCESS_TOKEN}' },
    note: 'GitHub repos, issues, PRs',
  },
  filesystem: {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '.'],
    note: 'Local filesystem access (scoped to cwd)',
  },
  postgres: {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-postgres', '${DATABASE_URL}'],
    note: 'Read-only Postgres queries',
  },
  supabase: {
    command: 'npx',
    args: ['-y', '@supabase/mcp-server-supabase@latest'],
    env: { SUPABASE_ACCESS_TOKEN: '${SUPABASE_ACCESS_TOKEN}' },
    note: 'Supabase project management',
  },
  puppeteer: {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-puppeteer'],
    note: 'Headless browser automation',
  },
};

export function buildMcpServers(keys) {
  const servers = {};
  for (const key of keys || []) {
    const entry = MCP_CATALOG[key];
    if (!entry) continue;
    const { note, ...config } = entry;
    servers[key] = config;
  }
  return servers;
}

export function knownMcpKeys() {
  return Object.keys(MCP_CATALOG);
}

import { buildMcpServers } from '../lib/mcp-catalog.js';

export function renderMcp(p) {
  const servers = buildMcpServers(p.mcp || []);
  return JSON.stringify({ mcpServers: servers }, null, 2) + '\n';
}

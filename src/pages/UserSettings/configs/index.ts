// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

export type McpClientId = 'claude-code' | 'claude-desktop' | 'cursor' | 'codex';

export interface McpClientRecipe {
  id: McpClientId;
  name: string;
  format: 'JSON' | 'TOML';
  configuration: string;
  setupInstructions: string[];
}

export const MCP_SERVER_NAME = 'test-portal';
export const MCP_TOKEN_PLACEHOLDER = 'YOUR_MCP_TOKEN_HERE';

export function buildMcpEndpoint(useBeta: boolean, apiBaseUrl: string = import.meta.env.VITE_API_URL): string {
  const baseUrl = apiBaseUrl.replace(/\/+$/, '');
  const route = useBeta ? '/api/v2/mcp-beta' : '/api/v2/mcp';

  return `${baseUrl}${route}`;
}

function serializeJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function serializeTomlString(value: string): string {
  // JSON string escaping is compatible with TOML basic strings, including
  // quotes, backslashes, and control characters in configured URLs.
  return JSON.stringify(value);
}

function createClaudeCodeRecipe(endpoint: string): McpClientRecipe {
  return {
    id: 'claude-code',
    name: 'Claude Code',
    format: 'JSON',
    configuration: serializeJson({
      mcpServers: {
        [MCP_SERVER_NAME]: {
          type: 'http',
          url: endpoint,
          headers: { Authorization: `Bearer ${MCP_TOKEN_PLACEHOLDER}` },
        },
      },
    }),
    setupInstructions: [
      'Add this entry to your project .mcp.json file, merging it into the existing mcpServers object.',
      `Replace "${MCP_TOKEN_PLACEHOLDER}" with your MCP token. Keep this credential out of version control.`,
      'Reload or restart Claude Code and approve the server if prompted.',
    ],
  };
}

function createClaudeDesktopRecipe(endpoint: string): McpClientRecipe {
  const args = ['mcp-remote', endpoint];
  if (new URL(endpoint).protocol === 'http:') args.push('--allow-http');
  args.push('--header', 'Authorization:${AUTH_TOKEN}');

  return {
    id: 'claude-desktop',
    name: 'Claude Desktop',
    format: 'JSON',
    configuration: serializeJson({
      mcpServers: {
        [MCP_SERVER_NAME]: {
          command: 'npx',
          args,
          env: { AUTH_TOKEN: `Bearer ${MCP_TOKEN_PLACEHOLDER}` },
        },
      },
    }),
    setupInstructions: [
      'In Claude Desktop, open Settings → Developer → Edit Config to open claude_desktop_config.json; merge this entry into the existing mcpServers object.',
      `Replace "${MCP_TOKEN_PLACEHOLDER}" in AUTH_TOKEN with your MCP token. Keep this credential out of shared files.`,
      'Save the file and fully quit and restart Claude Desktop. Node.js and npx must be installed for the local mcp-remote bridge.',
    ],
  };
}

function createCursorRecipe(endpoint: string): McpClientRecipe {
  return {
    id: 'cursor',
    name: 'Cursor',
    format: 'JSON',
    configuration: serializeJson({
      mcpServers: {
        [MCP_SERVER_NAME]: {
          url: endpoint,
          headers: { Authorization: `Bearer ${MCP_TOKEN_PLACEHOLDER}` },
        },
      },
    }),
    setupInstructions: [
      'Add this entry to your personal ~/.cursor/mcp.json file, merging it into the existing mcpServers object.',
      `Replace "${MCP_TOKEN_PLACEHOLDER}" with your MCP token. Keep this credential out of version control.`,
      'Save the file, then restart or reload Cursor.',
    ],
  };
}

function createCodexRecipe(endpoint: string): McpClientRecipe {
  const configuration = [
    `[mcp_servers.${MCP_SERVER_NAME}]`,
    `url = ${serializeTomlString(endpoint)}`,
    `http_headers = { Authorization = ${serializeTomlString(`Bearer ${MCP_TOKEN_PLACEHOLDER}`)} }`,
  ].join('\n');

  return {
    id: 'codex',
    name: 'Codex',
    format: 'TOML',
    configuration,
    setupInstructions: [
      'Merge this table into your personal ~/.codex/config.toml file; preserve other MCP server tables.',
      `Replace "${MCP_TOKEN_PLACEHOLDER}" with your MCP token. Keep this credential out of shared files.`,
      'Save the file and restart the Codex client or session.',
    ],
  };
}

export function createMcpClientRecipes(endpoint: string): McpClientRecipe[] {
  return [
    createClaudeCodeRecipe(endpoint),
    createClaudeDesktopRecipe(endpoint),
    createCursorRecipe(endpoint),
    createCodexRecipe(endpoint),
  ];
}

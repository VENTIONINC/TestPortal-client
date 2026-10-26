// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { buildMcpEndpoint, createMcpClientRecipes, MCP_TOKEN_PLACEHOLDER } from '@/pages/UserSettings/configs';

describe('MCP client configuration recipes', () => {
  it.each([
    [false, 'https://api.example.test', 'https://api.example.test/api/v2/mcp'],
    [true, 'https://api.example.test/', 'https://api.example.test/api/v2/mcp-beta'],
    [false, 'https://api.example.test/portal/', 'https://api.example.test/portal/api/v2/mcp'],
    [true, 'http://localhost:3001/portal///', 'http://localhost:3001/portal/api/v2/mcp-beta'],
  ] as [boolean, string, string][])('builds the configured endpoint for beta=%s and base URL %s', (useBeta, baseUrl, expected) => {
    expect(buildMcpEndpoint(useBeta, baseUrl)).toBe(expected);
  });

  it.each([
    ['https://api.example.test/portal/api/v2/mcp', false],
    ['https://api.example.test/portal/api/v2/mcp-beta', false],
    ['http://localhost:3001/portal/api/v2/mcp', true],
    ['http://localhost:3001/portal/api/v2/mcp-beta', true],
  ] as [string, boolean][])('generates four recipes for %s', (endpoint, expectsAllowHttp) => {
    const recipes = createMcpClientRecipes(endpoint);

    expect(recipes.map(({ id }) => id)).toEqual(['claude-code', 'claude-desktop', 'cursor', 'codex']);
    for (const recipe of recipes) {
      expect(recipe.configuration.match(new RegExp(endpoint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'))).toHaveLength(1);
      expect(recipe.configuration).toContain(`Bearer ${MCP_TOKEN_PLACEHOLDER}`);
      expect(recipe.setupInstructions.join(' ')).toMatch(/merg(e|ing)/i);
      expect(recipe.setupInstructions.join(' ')).toMatch(/replace/i);
      expect(recipe.setupInstructions.join(' ')).toMatch(/restart|reload/i);
    }

    const claudeCode = JSON.parse(recipes[0].configuration);
    const claudeDesktop = JSON.parse(recipes[1].configuration);
    const cursor = JSON.parse(recipes[2].configuration);
    expect(claudeCode.mcpServers['test-portal']).toMatchObject({
      type: 'http',
      url: endpoint,
      headers: { Authorization: `Bearer ${MCP_TOKEN_PLACEHOLDER}` },
    });
    expect(claudeDesktop.mcpServers['test-portal'].args).toContain(endpoint);
    expect(claudeDesktop.mcpServers['test-portal'].args.includes('--allow-http')).toBe(expectsAllowHttp);
    expect(claudeDesktop.mcpServers['test-portal'].env.AUTH_TOKEN).toBe(`Bearer ${MCP_TOKEN_PLACEHOLDER}`);
    expect(cursor.mcpServers['test-portal']).toMatchObject({
      url: endpoint,
      headers: { Authorization: `Bearer ${MCP_TOKEN_PLACEHOLDER}` },
    });
    expect(recipes[3].configuration).toContain(`url = "${endpoint}"`);
    expect(recipes[3].configuration).toContain(`Authorization = "Bearer ${MCP_TOKEN_PLACEHOLDER}"`);
  });

  it('escapes configured URL strings in Codex TOML', () => {
    const endpoint = 'https://api.example.test/path?label="quoted"&value=back\\slash';
    const codex = createMcpClientRecipes(endpoint).find(({ id }) => id === 'codex');

    expect(codex?.configuration).toContain('url = "https://api.example.test/path?label=\\"quoted\\"&value=back\\\\slash"');
  });
});

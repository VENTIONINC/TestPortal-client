// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

export const mpcConfigString = `{
  "mcpServers": {
    "test-portal": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "${import.meta.env.VITE_API_URL}/api/v2/mcp",
        "--allow-http",
        "--header",
        "Authorization:\${AUTH_TOKEN}"
      ],
      "env": {
        "AUTH_TOKEN": "Bearer YOUR_MCP_TOKEN_HERE"
      }
    }
  }
}`;
